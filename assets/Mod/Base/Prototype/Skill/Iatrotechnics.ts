import { log, SpriteFrame } from "cc";
import { settingManager } from "db://assets/Script/Game/Manager/SettingManager";
import { RegisterPlayerSkill, RegisterSkillUpLevel } from "db://assets/Script/Game/System/SkillConfig";
import { CcNative } from "db://assets/Module/CcNative";
import { LanguageEntry } from "db://assets/Module/Language/LanguageEntry";
import { LanguageManager, RegisterLanguageEntry } from "db://assets/Module/Language/LanguageManager";
import { CharacterInstance } from "db://assets/Script/System/Core/Instance/CharacterInstance";
import { FromType } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { SkillFailReason, SkillPrototype } from "db://assets/Script/System/Core/Prototype/SkillPrototype";
import { RegisterSkill } from "db://assets/Script/System/Manager/SkillManager";
import { DefenseUp } from "../Buff/DefenseUp";
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
        return `<color=0E70FB>消耗: ${ this.data.lv * 10 + 30 } 魔法值</color>\n` + 
        `恢复 ${ (this.data.lv - 1) * 3 + 5 }% 最大生命值 ，最低回复 ${ (this.data.lv - 1) * 10 + 50 } 生命值`
    }

    public get eng(): string {
        return `<color=0E70FB>Cost: ${ this.data.lv * 10 + 30 } MP</color>\n` + 
        `Restore ${ (this.data.lv - 1) * 3 + 5 }% max HP, minimum ${ (this.data.lv - 1) * 10 + 50 } HP`
    }

    public get jpn(): string {
        return `<color=0E70FB>消費: ${ this.data.lv * 10 + 30 } MP</color>\n` +
        `最大体力値 ${ (this.data.lv - 1) * 3 + 5 }% 回復、最低 ${ (this.data.lv - 1) * 10 + 50 } 生命値 回復`
    }

}

@RegisterSkill("Iatrotechnics")
@RegisterPlayerSkill("Iatrotechnics", "Brave")
@RegisterSkillUpLevel("Iatrotechnics" , (lv: number) => ({
    diamond: lv * 50 + 150 ,
    gold: Math.pow(2 , lv) * 100 + 100 , 
}))
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
        return { hp: 0, mp: this.instance.lv * 20 + 40 }
    }

    public get coolTime(): number {
        return 20 - this.instance.lv * 1.5
    }

    public use(useOption: { use: CharacterInstance; }): void {
        useOption.use.increaseHp({
            increase: Math.max(
                useOption.use.maxHp * ((this.instance.lv - 1) * 3 + 5) / 100 , 
                (this.instance.lv - 1) * 10 + 50
            ),
            fromType: FromType.skill,
            from: useOption.use,
        })
    }

    public useFail(reason: SkillFailReason, progress: SkillProgress): void {
        if (reason === SkillFailReason.NotEnoughCoast)
            message.toast(LanguageManager.getEntry("Iatrotechnics Fail").getValue(settingManager.data.language))
    }

}

@RegisterLanguageEntry("Iatrotechnics Fail")
class IatrotechnicsFail extends LanguageEntry {
    public get chs(): string {
        return "当前法力值不足以使用该技能"
    }
    public get eng(): string {
        return "Not enough MP to use this skill"
    }
    public get jpn(): string {
        return "MPが足りません"
    }
}