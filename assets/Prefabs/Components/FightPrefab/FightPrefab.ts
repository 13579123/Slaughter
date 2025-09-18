import { _decorator, Component, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { CharacterEvent, CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { FightCharacterPrefab } from './FightCharacterPrefab';
import { Rx } from 'db://assets/Module/Rx';
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
        ])
        // 两边角色开始攻击
        const startAttack = async (
            character: CharacterInstance,
            characterPrefab: FightCharacterPrefab,
            target: CharacterInstance
        ) => {
            return new Promise(res => {
                this.setAutoInterval(async () => {
                    await characterPrefab.characterAttack(() => {
                        character.attackCharacter({ target })
                    })
                    if (this.leftCharacter.hasDeath || this.rightCharacter.hasDeath)
                        res(null)
                } , {count: -1 , timer: 100})
            })
        }
        // 两边角色开始攻击
        await Promise.all([
            startAttack(this.leftCharacter, this.leftCharacterPrefab, this.rightCharacter),
            startAttack(this.rightCharacter, this.rightCharacterPrefab, this.leftCharacter)
        ])
        // 播放死亡动画
        await Promise.all([
            (async () => {
                if (this.leftCharacter.hasDeath) await this.leftCharacterPrefab.characterDie()
                else this.leftCharacterPrefab.characterReady()
            })(),
            (async () => {
                if (this.rightCharacter.hasDeath) await this.rightCharacterPrefab.characterDie()
                else this.rightCharacterPrefab.characterReady()
            })()
        ])
        // 开始战斗
        return new Promise<"left" | "right"| "none">(async (res) => {
            if (this.leftCharacter.hasDeath && this.rightCharacter.hasDeath) res("none")
            if (this.leftCharacter.hasDeath) res("right")
            else if (this.rightCharacter.hasDeath) res("left")
        })
    }

}


