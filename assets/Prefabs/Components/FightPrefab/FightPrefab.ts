import { _decorator, Color, Component, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { CharacterEvent, CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { FightCharacterPrefab } from './FightCharacterPrefab';
import { Rx } from 'db://assets/Module/Rx';
import { DamageType, FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
import { Normal } from 'db://assets/Script/System/Normal';
const { ccclass, property } = _decorator;

type FightOption = {
    // 那一边是玩家
    player: "left" | "right" | "none",
    // 左侧角色
    leftCharacter: CharacterInstance,
    // 右侧角色
    rightCharacter: CharacterInstance,
    // 战斗开始回调
    onStart?: () => void,
}

@ccclass('FightPrefab')
export class FightPrefab extends ExtensionComponent {

    // 战斗角色预制体
    @property(Prefab)
    protected CharacterPrefab: Prefab

    // 左右侧角色 
    public leftCharacter: CharacterInstance;
    public rightCharacter: CharacterInstance;

    // 是否已经开始了战斗
    protected _hasStart: boolean = false;
    public get hasStart() { return this._hasStart; }

    // 两边角色组件
    protected leftCharacterPrefab: FightCharacterPrefab;
    protected rightCharacterPrefab: FightCharacterPrefab;

    // 设置战斗数据并且开始战斗
    public async setFightAndStart(option: FightOption) {
        if (this.hasStart) return;
        this._hasStart = true;
        // 设置数据
        this.leftCharacter = Rx.reactive(option.leftCharacter)
        this.rightCharacter = Rx.reactive(option.rightCharacter)
        // 创建角色
        await this.createCharacter(option.player)
        // 两边角色播放入场动画
        await Promise.all([
            this.leftCharacterPrefab.characterEnter(),
            this.rightCharacterPrefab.characterEnter()
        ])
        // 开始战斗
        option.onStart && option.onStart()
        // 开始战斗
        const result = await this.startFight()
        // 返回战斗结果
        return result
    }

    // 创建两个角色
    protected async createCharacter(playerPos = "none") {
        // 左侧
        const leftNode = CcNative.instantiate(this.CharacterPrefab)
        const leftCharacterPrefab = leftNode.getComponent(FightCharacterPrefab)
        await leftCharacterPrefab.bindCharacter(this.leftCharacter, "left", playerPos !== "left")
        this.node.getChildByName("LeftCharacterContainer").addChild(leftNode)
        this.leftCharacterPrefab = leftCharacterPrefab
        // 右侧
        const rightNode = CcNative.instantiate(this.CharacterPrefab)
        const rightCharacterPrefab = rightNode.getComponent(FightCharacterPrefab)
        await rightCharacterPrefab.bindCharacter(this.rightCharacter, "right", playerPos !== "right")
        this.node.getChildByName("RightCharacterContainer").addChild(rightNode)
        this.rightCharacterPrefab = rightCharacterPrefab
    }

    // 开始战斗逻辑
    protected async startFight(): Promise<"left" | "right" | "none"> {
        // 两边角色进入准备状态
        await Promise.all([
            this.leftCharacterPrefab.characterReady(),
            this.rightCharacterPrefab.characterReady()
        ]);
        // 绑定回血扣血回调
        [
            {character: this.leftCharacter , prefab: this.leftCharacterPrefab},
            {character: this.rightCharacter , prefab: this.rightCharacterPrefab}
        ].forEach(async ({character, prefab , }) => {
            character.on(CharacterEvent.ReduceHp, (progress: {
                reduce: number,
                type: DamageType,
                from: CharacterInstance,
                fromType: FromType,
                critical: boolean,
            }) => {
                if (progress.reduce <= 0) return
                let color = new Color(255, 255, 255)
                if (progress.type === DamageType.real) color = new Color(255, 255, 255)
                if (progress.type === DamageType.physic) color = new Color(250, 15, 15)
                if (progress.type === DamageType.magic) color = new Color(10, 50, 200)
                if (progress.type === DamageType.light) color = new Color(230, 150, 15)
                if (progress.type === DamageType.dark) color = new Color(125, 10, 230)
                prefab.showMessage(
                    (progress.critical ? "暴击" : "") + `-${Normal.number(progress.reduce)}` , color
                )
            })
            character.on(CharacterEvent.IncreaseHp , (progress: {
                increase: number,
                from?: CharacterInstance,
                fromType?: FromType
            }) => {
                prefab.showMessage(`+${Normal.number(progress.increase)}` , new Color(85, 225 , 0))
            })
        })
        // 两边角色开始攻击
        const startAttack = async (
            character: CharacterInstance,
            target: CharacterInstance
        ) => {
            return new Promise(res => {
                let isAttacking = false
                const stop = this.setAutoInterval(() => {
                    if (isAttacking) return
                    isAttacking = true
                    character.attackCharacter({
                        target , afterAttack: () => isAttacking = false
                    })
                }, { count: -1, timer: 600 / character.attackSpeed })
                character.on(CharacterEvent.Death, () => {
                    stop()
                    res(null)
                })
                target.on(CharacterEvent.Death, () => {
                    stop()
                    res(null)
                })
                return
            })
        }
        // 两边角色开始攻击
        await Promise.race([
            startAttack(this.leftCharacter, this.rightCharacter),
            startAttack(this.rightCharacter, this.leftCharacter),
        ])
        if (!this.leftCharacter.hasDeath) this.leftCharacterPrefab.characterReady()
        if (!this.rightCharacter.hasDeath) this.rightCharacterPrefab.characterReady()
        // 死亡角色播放死亡动画
        await Promise.all([
            this.leftCharacter.hasDeath ? this.leftCharacterPrefab.characterDie() : null,
            this.rightCharacter.hasDeath ? this.rightCharacterPrefab.characterDie() : null,
        ].filter(v => v))
        // 开始战斗
        return new Promise<"left" | "right" | "none">(async (res) => {
            if (this.leftCharacter.hasDeath && this.rightCharacter.hasDeath) res("none")
            if (this.leftCharacter.hasDeath) res("right")
            else if (this.rightCharacter.hasDeath) res("left")
        })
    }

}


