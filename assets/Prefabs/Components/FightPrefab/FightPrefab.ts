import { _decorator, Button, Color, Component, instantiate, Label, Node, Prefab, Sprite } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { CharacterEvent, CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { FightCharacterPrefab } from './FightCharacterPrefab';
import { Rx } from 'db://assets/Module/Rx';
import { DamageType, FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
import { Normal } from 'db://assets/Script/System/Normal';
import { isSkillPassive } from 'db://assets/Script/Game/System/SkillConfig';
import { getCharacterKey } from 'db://assets/Script/System/Manager/CharacterManager';
import { getSkillKey } from 'db://assets/Script/System/Manager/SkillManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { LanguageManager } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
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

    // 玩家位置
    protected playerPosition: "left" | "right" | "none" = "none";

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
        // 技能面版展示
        this.createSkillPanel()
        // 两边角色播放入场动画
        await Promise.all([ 
            this.leftCharacterPrefab.characterEnter() , 
            this.rightCharacterPrefab.characterEnter() 
        ])
        // 开始战斗
        option.onStart && option.onStart()
        // 开始战斗
        const result = await this.startFight()
        // 返回战斗结果
        return result
    }

    // 创建技能面版展示
    protected async createSkillPanel() {
        // 技能面版
        const skillPanel = this.node.getChildByName("SkillPanel")
        // 技能面版位置
        const threeNodePos = [{x: -250 , y: 80} , {x: 0 , y: 215} , {x: 250 , y: 80}]
        // 模板节点
        const skillItemTemp = skillPanel.getChildByName("SkillContainer").getChildByName("SkillItem")
        skillItemTemp.parent = null
        // 获取玩家数据
        const playerData = this.getPlayerData()
        // 这一局不存在玩家 隐藏技能面版
        if (!playerData) {
            skillPanel.active = false
            return
        } else skillPanel.active = true
        // 遍历技能数据
        let index = 0
        playerData.character.skills.map(skill => {
            // 如果是被动技能则跳过
            const isPassive = isSkillPassive(
                getCharacterKey(playerData.character.proto) , 
                getSkillKey(skill.proto)
            )
            if (isPassive) return null
            // 创建技能节点
            const skillNode = instantiate(skillItemTemp)
            // 图标
            skill.proto.icon().then(spriteFrame => 
                skillNode.getChildByName("Icon")
                .getComponent(Sprite).spriteFrame = spriteFrame
            )
            // 时间展示绑定
            const coollingNode = skillNode.getChildByName("Coolling")
            this.effect(() => {
                if (skill.coolTime !== 0) coollingNode.active = true
                else coollingNode.active = false
                coollingNode.getChildByName("CoollingTime").getComponent(Label).string = 
                    `${(skill.coolTime / 1000).toFixed(1)}s`
            })
            // 绑定点击按钮
            skillNode.getChildByName("Icon").on(
                Button.EventType.CLICK , 
                async () => {
                    if (await playerData.character.isSkillAble(skill)) 
                        playerData.characterPrefab.characterUseSkill( skill )
                }
            )
            skillPanel.getChildByName("SkillContainer").addChild(skillNode)
            index++
        })
        return
    }

    // 创建两个角色
    protected async createCharacter(playerPos = "none") {
        this.playerPosition = playerPos as any
        // 左侧 
        const leftNode = CcNative.instantiate(this.CharacterPrefab)
        const leftCharacterPrefab = leftNode.getComponent(FightCharacterPrefab)
        await leftCharacterPrefab.bindCharacter(this.leftCharacter, "left", playerPos !== "left")
        this.node.getChildByName("LeftCharacterContainer").addChild(leftNode)
        this.leftCharacterPrefab = leftCharacterPrefab
        leftCharacterPrefab.fightPrefab = this
        // 右侧
        const rightNode = CcNative.instantiate(this.CharacterPrefab)
        const rightCharacterPrefab = rightNode.getComponent(FightCharacterPrefab)
        await rightCharacterPrefab.bindCharacter(this.rightCharacter, "right", playerPos !== "right")
        this.node.getChildByName("RightCharacterContainer").addChild(rightNode)
        this.rightCharacterPrefab = rightCharacterPrefab
        rightCharacterPrefab.fightPrefab = this
    }

    // 逃跑回调
    protected escapeCallback: Function = null

    // 开始战斗逻辑
    protected async startFight(): Promise<"left" | "right" | "none"> {
        let stopGame = false
        // 两边角色进入准备状态
        this.leftCharacterPrefab.characterReady();
        this.rightCharacterPrefab.characterReady();
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
            target: CharacterInstance,
            characterPrefab: FightCharacterPrefab,
            targetPrefab: FightCharacterPrefab,
            pos: string
        ) => {
            return new Promise(async res => {
                let stop = false
                character.on(CharacterEvent.Death, () => {
                    (stop = true);
                    res(null)
                })
                target.on(CharacterEvent.Death, () => {
                    (stop = true) ; 
                    res(null)
                })
                while(!stop && !stopGame) {
                    await characterPrefab.characterAction(target)
                    characterPrefab.characterReady()
                    // 攻击间隔
                    await new Promise(
                        resolve => this.setAutoInterval(() => resolve(null) , {count: 1 , timer: 800 / character.attackSpeed})
                    )
                }
                return
            })
        }
        // 战斗结算
        return new Promise<"left" | "right" | "none">(async (res) => {
            // 逃跑回调
            this.escapeCallback = () => {
                stopGame = true
                res("none")
            }
            // 两边角色开始攻击
            await Promise.all([
                startAttack(this.leftCharacter, this.rightCharacter , this.leftCharacterPrefab , this.rightCharacterPrefab , "left"),
                startAttack(this.rightCharacter, this.leftCharacter , this.rightCharacterPrefab , this.leftCharacterPrefab , "right"),
            ])
            if (!this.leftCharacter.hasDeath) this.leftCharacterPrefab.characterReady()
            if (!this.rightCharacter.hasDeath) this.rightCharacterPrefab.characterReady()
            // 结算
            if (this.leftCharacter.hasDeath && this.rightCharacter.hasDeath) res("none")
            if (this.leftCharacter.hasDeath) res("right")
            else if (this.rightCharacter.hasDeath) res("left")
        })
    }

    // 逃跑函数
    protected escape(): void {
        message.confirm(
            LanguageManager.getEntry("Warning").getValue(settingManager.data.language),
            (new class extends LanguageEntry {
                public get chs(): string {
                    return "你确定要逃跑吗？逃跑将视为失败，无法获得任何奖励";
                }
                public get eng(): string {
                    return "Are you sure you want to escape? Escaping will be considered a failure and you will not receive any rewards";
                }
                public get jpn(): string {
                    return "本当に逃げますか？逃げると失敗と見なされ、報酬を受け取ることができません";
                }
            }).getValue(settingManager.data.language),
            LanguageManager.getEntry("Confirm").getValue(settingManager.data.language),
            LanguageManager.getEntry("Cancel").getValue(settingManager.data.language) ,
            this.node
        ).then(res => {
            if (res) this.escapeCallback && this.escapeCallback()
        })
        return
    }

    // 获取玩家角色
    protected getPlayerData(): {character: CharacterInstance , characterPrefab: FightCharacterPrefab} {
        if (this.playerPosition === "none") return null
        if (this.playerPosition === "left") return {character: this.leftCharacter, characterPrefab: this.leftCharacterPrefab}
        if (this.playerPosition === "right") return {character: this.rightCharacter, characterPrefab: this.rightCharacterPrefab}
    }

}


