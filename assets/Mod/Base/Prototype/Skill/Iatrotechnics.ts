import { log, SpriteFrame } from "cc";
import { settingManager } from "db://assets/Script/Game/Manager/SettingManager";
import { RegisterPlayerSkill } from "db://assets/Script/Game/System/SkillTree";
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
        return `消耗${this.data.lv * 10 + 30}的魔法值，回复${this.data.lv * 4 + 5}%的生命值`;
    }

    public get eng(): string {
        return `Consumes ${this.data.lv * 10 + 30} of magic value to recover ${this.data.lv * 4 + 5}% of health`
    }

    public get jpn(): string {
        return `魔法値の${this.data.lv * 10 + 30}を消費して、${this.data.lv * 4 + 5}%の生命値を回復する`
    }

}

@RegisterSkill("Iatrotechnics")
@RegisterPlayerSkill("Iatrotechnics", "Brave")
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
        log(`使用 治疗术 回复了 ${useOption.use.maxHp * (this.instance.lv * 4 + 5) / 100} 生命值`)
        useOption.use.increaseHp({
            increase: useOption.use.maxHp * (this.instance.lv * 4 + 5) / 100,
            fromType: FromType.skill,
            from: useOption.use,
        })
    }

}


