import { _decorator, Component, Node, SpriteFrame, sp, UITransform } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { RegisterPlayerSkill, RegisterSkillUpLevel } from 'db://assets/Script/Game/System/SkillConfig';
import { SkillFailReason, SkillPrototype } from 'db://assets/Script/System/Core/Prototype/SkillPrototype';
import { RegisterSkill } from 'db://assets/Script/System/Manager/SkillManager';
const { ccclass, property } = _decorator;
import { Rx } from 'db://assets/Module/Rx';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
import { DamageType, FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
import { SkillProgress } from 'db://assets/Script/System/Core/Progress/FightProgress';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { getComponentByCharacter } from 'db://assets/Script/Game/System/CharacterToPrefabMap';
import { LoadingManager } from 'db://assets/Module/Manager/LoadingManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { getBaseModManager } from '../../../AssetManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';

@RegisterLanguageEntry("Enchanter")
class Name extends LanguageEntry {

    public get chs(): string {
        return "巫师";
    }

    public get eng(): string {
        return "Enchanter"
    }

    public get jpn(): string {
        return "エンチャンター"
    }

}
@RegisterLanguageEntry("Enchanter Description")
class Description extends LanguageEntry {

    public get chs(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `提升 ${lv * 20 + 30} 魔力值和 ${lv * 30 + 50} 魔法值`
    }

    public get eng(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `Boost ${lv * 20 + 30} mana and ${lv * 30 + 50} magic`
    }

    public get jpn(): string {
        const lv = Math.max(0, this.data.lv - 1)
        return `魔力 ${lv * 20 + 30} と魔法 ${lv * 30 + 50} を上昇`
    }

}

@RegisterSkill("Enchanter")
@RegisterPlayerSkill("Enchanter", "Brave" , true , "DivineLight")
@RegisterSkillUpLevel("Enchanter", (lv: number) => ({
    diamond: lv * 50 + 150,
    gold: Math.pow(2, lv) * 100 + 100,
}))
export class Enchanter extends SkillPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Enchanter").getValue(settingManager.data.language)
    }

    public get description(): string {
        const character = this.instance.characterInstance
        if (!character) return ""
        return LanguageManager.getEntry("Enchanter Description")
            .getValue(settingManager.data.language, { lv: this.instance.lv })
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Skill/Enchanter/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get extraProperty(): Partial<BasePrototypeProperty> {
        return {
            magicAttack: this.instance.lv * 20 + 30 ,
            maxMp: this.instance.lv * 30 + 50
        }
    }

}
