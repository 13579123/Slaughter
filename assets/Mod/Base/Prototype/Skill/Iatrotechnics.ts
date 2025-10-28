import { debug, log, SpriteFrame } from "cc";
import { settingManager } from "db://assets/Script/Game/Manager/SettingManager";
import { RegisterPlayerSkill, RegisterSkillUpLevel } from "db://assets/Script/Game/System/SkillConfig";
import { CcNative } from "db://assets/Module/CcNative";
import { LanguageEntry } from "db://assets/Module/Language/LanguageEntry";
import { LanguageManager, RegisterLanguageEntry } from "db://assets/Module/Language/LanguageManager";
import { CharacterInstance } from "db://assets/Script/System/Core/Instance/CharacterInstance";
import { FromType } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { SkillFailReason, SkillPrototype } from "db://assets/Script/System/Core/Prototype/SkillPrototype";
import { RegisterSkill } from "db://assets/Script/System/Manager/SkillManager";
import { Rx } from "db://assets/Module/Rx";
import { SkillProgress } from "db://assets/Script/System/Core/Progress/FightProgress";
import { message } from "db://assets/Script/Game/Message/Message";

@RegisterLanguageEntry("Iatrotechnics_Name")
class Iatrotechnics_Name extends LanguageEntry {

    public get chs(): string {
        return "治疗术";
    }

    public get eng(): string {
        return "Iatrotechnics"
    }

    public get jpn(): string {
        return "治療術"
    }

}
@RegisterLanguageEntry("Iatrotechnics_Description")
class Iatrotechnics_Description extends LanguageEntry {

    public get chs(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `<color=0E70FB>消耗: ${Math.max(1, lv) * 20 + 40} 魔法值</color>\n冷却时间: ${20 - lv * 1.5}s\n` +
            `恢复 ${Math.max(1, lv) * 20 + 80}% 魔力值的生命值 ，最低回复 ${Math.max(0, lv) * 50 + 50} 生命值`
    }

    public get eng(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `<color=0E70FB>Cost: ${Math.max(1, lv) * 20 + 40} MP</color>\nCooldown: ${20 - lv * 1.5}s\n` +
            `Restore HP equal to ${Math.max(1, lv) * 20 + 80}% of your MP, minimum ${Math.max(0, lv) * 50 + 50} HP`
    }

    public get jpn(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `<color=0E70FB>消費: ${Math.max(1, lv) * 20 + 40} MP</color>\nクールタイム: ${20 - lv * 1.5}秒\n` +
            `MPの${Math.max(1, lv) * 20 + 80}%に相当するHPを回復、最低回復量は${Math.max(0, lv) * 50 + 50}HP`
    }

}

@RegisterPlayerSkill("Iatrotechnics", "Brave")
@RegisterSkillUpLevel("Iatrotechnics", (lv: number) => ({
    diamond: lv * 50 + 150,
    gold: Math.pow(2, lv) * 100 + 100,
}))
@RegisterSkill("Iatrotechnics")
export class Iatrotechnics extends SkillPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Iatrotechnics_Name").getValue(
            settingManager.data.language,
            { lv: this.instance.lv }
        )
    }

    public get description(): string {
        return LanguageManager.getEntry("Iatrotechnics_Description").getValue(
            settingManager.data.language,
            { lv: this.instance.lv }
        )
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Skill/Iatrotechnics/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get cost(): { hp: number; mp: number; } {
        return { hp: 0, mp: Math.max(1, this.instance.lv - 1) * 20 + 40 }
    }

    public get coolTime(): number {
        if (!this.instance.characterInstance) return 20 - this.instance.lv * 1.5
        return (20 - this.instance.lv * 1.5) * (1 - this.instance.characterInstance.coolDown / (this.instance.characterInstance.coolDown + 150))
    }

    public async use(useOption: { use: CharacterInstance; }) {
        const increase = Math.max(
            useOption.use.magicAttack * ((Math.max(1, this.instance.lv - 1) * 20 + 80) / 100),
            Math.max(0, this.instance.lv - 1) * 50 + 50
        )
        useOption.use.increaseHp({
            increase: increase,
            fromType: FromType.skill,
            from: useOption.use,
        })
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