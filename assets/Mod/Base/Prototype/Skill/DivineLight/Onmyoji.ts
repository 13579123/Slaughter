import { _decorator, Component, Node, SpriteFrame, sp, UITransform } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { RegisterPlayerSkill, RegisterSkillUpLevel } from 'db://assets/Script/Game/System/SkillConfig';
import { SkillFailReason, SkillPrototype } from 'db://assets/Script/System/Core/Prototype/SkillPrototype';
import { RegisterSkill } from 'db://assets/Script/System/Manager/SkillManager';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';

@RegisterLanguageEntry("Onmyoji")
class Name extends LanguageEntry {

    public get chs(): string {
        return "阴阳师";
    }

    public get eng(): string {
        return "Onmyoji"
    }

    public get jpn(): string {
        return "阴阳師"
    }

}
@RegisterLanguageEntry("Onmyoji Description")
class Description extends LanguageEntry {

    public get chs(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `提升 ${lv * 20 + 30} 光攻击和 ${lv * 20 + 30} 暗攻击`
    }

    public get eng(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `Boost ${lv * 20 + 30} light attack and ${lv * 20 + 30} dark attack`
    }

    public get jpn(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `光攻 ${lv * 20 + 30} 和 暗攻 ${lv * 20 + 30} をアップ`
    }

}

@RegisterSkill("Onmyoji")
@RegisterPlayerSkill("Onmyoji", "Brave" , true , "DivineLight")
@RegisterSkillUpLevel("Onmyoji", (lv: number) => ({
    diamond: lv * 50 + 150,
    gold: Math.pow(2, lv) * 100 + 100,
}))
export class Enchanter extends SkillPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Onmyoji").getValue(settingManager.data.language)
    }

    public get description(): string {
        const character = this.instance.characterInstance
        if (!character) return ""
        return LanguageManager.getEntry("Onmyoji Description")
            .getValue(settingManager.data.language, { lv: this.instance.lv })
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Skill/Onmyoji/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get extraProperty(): Partial<BasePrototypeProperty> {
        const lv = Math.max(0, this.instance.lv - 1)
        return {
            lightAttack: lv * 20 + 30 ,
            darkAttack: lv * 20 + 30
        }
    }

}
