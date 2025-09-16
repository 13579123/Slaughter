import { log, SpriteFrame } from "cc";
import { settingManager } from "db://assets/Script/Game/Manager/SettingManager";
import { RegisterPlayerSkill, RegisterSkillUpLevel } from "db://assets/Script/Game/System/SkillConfig";
import { CcNative } from "db://assets/Script/Module/CcNative";
import { LanguageEntry } from "db://assets/Script/Module/Language/LanguageEntry";
import { LanguageManager, RegisterLanguageEntry } from "db://assets/Script/Module/Language/LanguageManager";
import { CharacterInstance } from "db://assets/Script/System/Core/Instance/CharacterInstance";
import { FromType } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { SkillPrototype } from "db://assets/Script/System/Core/Prototype/SkillPrototype";
import { RegisterSkill } from "db://assets/Script/System/Manager/SkillManager";


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
        `恢复 ${ (this.data.lv - 1) * 3 + 5 }% 最大魔法值 ，最低回复 ${ (this.data.lv - 1) * 10 + 50 } 生命值`
    }

    public get eng(): string {
        return `<color=0E70FB>Cost: ${ this.data.lv * 10 + 30 } MP</color>\n` + 
        `Restore ${ (this.data.lv - 1) * 3 + 5 }% max MP, minimum ${ (this.data.lv - 1) * 10 + 50 } HP`
    }

    public get jpn(): string {
        return `<color=0E70FB>消費: ${ this.data.lv * 10 + 30 } MP</color>\n` +
        `最大魔法値 ${ (this.data.lv - 1) * 3 + 5 }% 回復、最低 ${ (this.data.lv - 1) * 10 + 50 } 生命値 回復`
    }

}

@RegisterSkill("Iatrotechnics")
@RegisterPlayerSkill("Iatrotechnics", "Brave")
@RegisterSkillUpLevel("Iatrotechnics" , (lv: number) => ({gold: Math.pow(2 , lv) * 100 , diamond: lv * 50 + 100}))
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
        return { hp: 0, mp: this.instance.lv * 10 + 30 }
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

}


