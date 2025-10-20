import { _decorator, Button, Component, find, Label, Node, Prefab, ScrollView, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;
import { Normal } from '../../Script/System/Normal';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
import { ModuleProgressPrefab } from '../../Module/Prefabs/ModuleProgressPrefab';
import { ReactiveEffectRunner } from '../../Module/Rx/reactivity';
import { characterManager } from '../../Script/Game/Manager/CharacterManager';
import { CharacterInstance } from '../../Script/System/Core/Instance/CharacterInstance';
import { CcNative } from '../../Module/CcNative';
import { DetailInfoPrefab } from './DetailInfoPrefab';
import { FightBuffItemPrefab } from './FightPrefab/FightBuffItemPrefab';
import { Rx } from '../../Module/Rx';
import { LanguageManager } from '../../Module/Language/LanguageManager';
import { settingManager } from '../../Script/Game/Manager/SettingManager';

@ccclass('UserBaseDataPrefab')
export class UserBaseDataPrefab extends ExtensionComponent {

    @property(Sprite)
    protected avatar: Sprite = null

    @property(ModuleProgressPrefab)
    protected hpProgress: ModuleProgressPrefab = null

    @property(ModuleProgressPrefab)
    protected mpProgress: ModuleProgressPrefab = null

    @property(ModuleProgressPrefab)
    protected expProgress: ModuleProgressPrefab = null

    @property(Label)
    protected numberLabel: Label = null

    @property(Label)
    protected levelLabel: Label = null

    @property(Node)
    protected buffContainer: Node = null

    @property(Prefab)
    protected FightBuffItemPrefab: Prefab = null
    
    protected effectList: ReactiveEffectRunner[] = []

    public async bindCharacter(characterInstance: CharacterInstance , showBuff = true) {
        characterInstance = Rx.reactive(characterInstance)
        this.effectList.forEach(r => r.effect.stop())
        this.effectList = []
        let globalId = 0
        // 隐藏buff列表
        if (!showBuff) this.buffContainer.active = false
        // 渲染头像
        const runner1 = this.effect(() => {
            const id = ++globalId
            characterInstance.proto.icon().then(res => {
                if (globalId === id) this.avatar.spriteFrame = res
            })
        })
        // 渲染血条
        const runner2 = this.effect(() => {
            this.numberLabel.string = `\n${Normal.number(characterInstance.hp * characterInstance.maxHp)}/${Normal.number(characterInstance.maxHp)}\n` +
                `${Normal.number(characterInstance.mp * characterInstance.maxMp)}/${Normal.number(characterInstance.maxMp)}\n` +
                `${Normal.number(characterManager.data.exp)}/${Normal.number(characterManager.data.maxExp)}\n`
            this.hpProgress.setProgress(characterInstance.hp)
            this.mpProgress.setProgress(characterInstance.mp)
            this.expProgress.setProgress(characterManager.data.exp / characterManager.data.maxExp)
            this.levelLabel.string = characterManager.data.lv + ""
        })
        // 渲染buff
        const runner3 = this.effect(() => {
            this.buffContainer.removeAllChildren()
            characterInstance.buffs.forEach(async buff => {
                const itemNode = CcNative.instantiate(this.FightBuffItemPrefab)
                itemNode.getComponent(FightBuffItemPrefab).setBuffData(buff)
                this.buffContainer.addChild(itemNode)
            })
        })
        // 渲染角色信息
        const runner4 = this.effect(() => this.initDetail(characterInstance))
        // 渲染角色信息
        const runner5 = this.effect(() => this.node.getChildByName("DetailProoerty").active = this.showDetailProperty.value)

        this.effectList.push(runner1, runner2, runner3 , runner4 , runner5)
    }

    // 初始化详细信息
    protected async initDetail(characterInstance: CharacterInstance) {
        const detailPropertyNode = this.node.getChildByName("DetailProoerty")
        const avatarSprite = detailPropertyNode.getChildByName("Avatar").getComponent(Sprite)
        detailPropertyNode.getChildByName("Title")
            .getComponent(Label).string = characterInstance.proto.name
        detailPropertyNode.getChildByName("Detail")
            .getComponent(ScrollView).content.getComponent(Label).string = characterInstance.proto.description
        // 渲染其他属性
        const label = detailPropertyNode.getChildByName("Property")
            .getComponent(ScrollView)
            .content
            .getComponent(Label)
        label.string = ""
        const property = [
            { key: "maxHp", force: false, fixed: 0, rate: 1, exit: "" },
            { key: "maxMp", force: false, fixed: 0, rate: 1, exit: "" },
            { key: "physicalAttack", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "magicAttack", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "lightAttack", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "darkAttack", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "physicalDefense", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "magicDefense", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "lightResistance", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "darkResistance", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "physicalPenetration", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "magicPenetration", force: false, fixed: 1, rate: 1, exit: "" },
            { key: "criticalRate", force: false, fixed: 1, rate: 100, exit: "%" },
            { key: "criticalDamage", force: false, fixed: 1, rate: 100, exit: "%" },
            { key: "attackSpeed", force: true, fixed: 2, rate: 1, exit: "" },
        ]
        property.forEach(setting => {
            label.string += `${LanguageManager.getEntry(setting.key).getValue(settingManager.data.language)
                }: ${Normal.number(characterInstance[setting.key] * setting.rate)}${setting.exit}\n`
        })
        avatarSprite.spriteFrame = await characterInstance.proto.icon()
    }
    
    // 修改是否展示详细信息
    public showDetailProperty = Rx.ref(false)

    // 改变展示用户详细信息
    protected openShowUserDetail() { this.showDetailProperty.value = true }
    protected closeShowUserDetail() { this.showDetailProperty.value = false }

}
