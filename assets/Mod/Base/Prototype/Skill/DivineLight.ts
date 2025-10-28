import { _decorator, Component, Node, SpriteFrame, sp, UITransform } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { RegisterPlayerSkill, RegisterSkillUpLevel } from 'db://assets/Script/Game/System/SkillConfig';
import { SkillFailReason, SkillPrototype } from 'db://assets/Script/System/Core/Prototype/SkillPrototype';
import { RegisterSkill } from 'db://assets/Script/System/Manager/SkillManager';
const { ccclass, property } = _decorator;
import { ExtraProperty as ExtraPropertyBuff } from '../Buff/ExtraProperty';
import { Rx } from 'db://assets/Module/Rx';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
import { DamageType, FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
import { SkillProgress } from 'db://assets/Script/System/Core/Progress/FightProgress';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { getBaseModManager } from '../../AssetManager';
import { getComponentByCharacter } from 'db://assets/Script/Game/System/CharacterToPrefabMap';
import { LoadingManager } from 'db://assets/Module/Manager/LoadingManager';
import { message } from 'db://assets/Script/Game/Message/Message';

@RegisterLanguageEntry("DivineLight")
class Name extends LanguageEntry {

    public get chs(): string {
        return "圣光术";
    }

    public get eng(): string {
        return "Divine Light"
    }

    public get jpn(): string {
        return "聖光術"
    }

}
@RegisterLanguageEntry("DivineLight Description")
class Description extends LanguageEntry {

    public get chs(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `<color=0E70FB>消耗: ${Math.max(1, lv) * 20 + 40} 魔法值</color>\n冷却时间: ${20 - lv * 1.5}s\n` +
            `造成 ${Math.max(1, lv) * 10 + 60}% 魔力值的魔法伤害和 ${Math.max(1, lv) * 10 + 25}% 魔力值的光伤害`
    }

    public get eng(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `<color=0E70FB>Cost: ${Math.max(1, lv) * 20 + 40} MP</color>\nCooldown: ${20 - lv * 1.5}s\n` +
            `Deal magic damage equal to ${Math.max(1, lv) * 10 + 60}% of MP and ${Math.max(1, lv) * 10 + 25}% magic light damage`
    }

    public get jpn(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `<color=0E70FB>消費: ${Math.max(1, lv) * 20 + 40} マナ</color>\nクールダウン: ${20 - lv * 1.5}s\n` +
            `魔力の ${Math.max(1, lv) * 10 + 60}% と光の ${Math.max(1, lv) * 10 + 25}% のダメージを与える`
    }

}

@RegisterSkill("DivineLight")
@RegisterPlayerSkill("DivineLight", "Brave")
@RegisterSkillUpLevel("DivineLight", (lv: number) => ({
    diamond: lv * 50 + 150,
    gold: Math.pow(2, lv) * 100 + 100,
}))
export class DivineLight extends SkillPrototype {

    public get name(): string {
        return LanguageManager.getEntry("DivineLight").getValue(settingManager.data.language)
    }

    public get description(): string {
        const character = this.instance.characterInstance
        if (!character) return ""
        return LanguageManager.getEntry("DivineLight Description")
            .getValue(settingManager.data.language, { lv: this.instance.lv })
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Skill/DivineLight/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get cost(): { hp: number; mp: number; } {
        return {
            mp: Math.max(1, this.instance.lv - 1) * 20 + 40,
            hp: 0,
        }
    }

    public get coolTime(): number {
        if (!this.instance.characterInstance) return 20 - this.instance.lv * 1.5
        return (20 - this.instance.lv * 1.5) * (1 - this.instance.characterInstance.coolDown / (this.instance.characterInstance.coolDown + 150))
    }

    public async use(useOption: { use: CharacterInstance; }) {
        // 战斗实例
        const fightInstance = getFightMapInstance()
        if (!fightInstance) return
        const target = this.instance.characterInstance === fightInstance.player ? fightInstance.currentMonster : fightInstance.player
        // 获取目标节点
        const targetPrefab = getComponentByCharacter(target)
        if (!targetPrefab) return
        // 播放特效动画
        const node = new Node()
        const uiTransform = node.addComponent(UITransform)
        const spineAnimation = node.addComponent(SpineAnimation)
        const skeletonDataPack = await getBaseModManager().load("Spine/Effect/0001/Hero_5404_effect", sp.SkeletonData, true)
        targetPrefab.node.addChild(node)
        await new Promise(res => {
            node.setScale(1.2, 1.2)
            node.setPosition(0, -120)
            spineAnimation.skeletonData = skeletonDataPack.value
            spineAnimation.playAnimation("skill_2", { count: 1 })
            spineAnimation.listenFrameEvent("Skill", () => res(null))
        })

        const magicReduce = Math.max(useOption.use.magicAttack * ((Math.max(1, this.instance.lv - 1) * 10 + 60) / 100), 1)
        const lightReduce = Math.max(useOption.use.magicAttack * ((Math.max(1, this.instance.lv - 1) * 10 + 25) / 100), 1)
        target.beDamage({ atk: magicReduce, type: DamageType.magic, from: fightInstance.player, fromType: FromType.skill })
        target.beDamage({ atk: lightReduce, type: DamageType.light, from: fightInstance.player, fromType: FromType.skill })
    }

    public useFail(reason: SkillFailReason, progress: SkillProgress): void {
        if (reason === SkillFailReason.NotEnoughCoast)
            message.toast((new class extends LanguageEntry {
                public get chs(): string {
                    return "当前法力值不足以使用该技能"
                }
                public get eng(): string {
                    return "Not enough MP to use this skill"
                }
                public get jpn(): string {
                    return "MPが足りません"
                }
            }).getValue(settingManager.data.language))
    }

}


// 预加载动画 
LoadingManager.addLoadingQueue(async () => {
    await getBaseModManager().load("Spine/Effect/0001/Hero_5404_effect", sp.SkeletonData, true)
})