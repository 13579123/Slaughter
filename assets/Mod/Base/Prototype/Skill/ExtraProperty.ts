import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageManager } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { RegisterPlayerSkill, RegisterSkillUpLevel } from 'db://assets/Script/Game/System/SkillConfig';
import { SkillPrototype } from 'db://assets/Script/System/Core/Prototype/SkillPrototype';
import { RegisterSkill } from 'db://assets/Script/System/Manager/SkillManager';
const { ccclass, property } = _decorator;
import { ExtraProperty as ExtraPropertyBuff } from '../Buff/ExtraProperty';
import { Rx } from 'db://assets/Module/Rx';
import { toRaw } from 'db://assets/Module/Rx/reactivity';

@RegisterSkill("ExtraProperty")
@RegisterPlayerSkill("ExtraProperty", "Brave", true)
@RegisterSkillUpLevel("ExtraProperty", (lv: number) => ({
    diamond: lv * 50 + 150,
    gold: Math.pow(2, lv) * 100 + 100,
}))
export class ExtraProperty extends SkillPrototype {

    public get name(): string {
        return LanguageManager.getEntry("ExtraProperty").getValue(settingManager.data.language)
    }

    public get description(): string {
        const character = this.instance.characterInstance
        if (!character) return ""
        return LanguageManager.getEntry("ExtraProperty Description")
            .getValue(settingManager.data.language , {
                physicalAttack: character.physicalAttack * 0.1 * this.instance.lv,
                magicAttack: character.magicAttack * 0.1 * this.instance.lv,
                attackSpeed: character.attackSpeed * 0.1 * this.instance.lv,
            })
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Skill/ExtraProperty/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public onCreate(): void {
        if (!this.instance.characterInstance) return
        const character = Rx.reactive(this.instance.characterInstance)
        character.addBuff({
            Proto: ExtraPropertyBuff, extraProperty: {
                physicalAttack: character.physicalAttack * 0.1 * this.instance.lv,
                magicAttack: character.magicAttack * 0.1 * this.instance.lv,
                attackSpeed: character.attackSpeed * 0.1 * this.instance.lv,
            }
        })
        return
    }
    
}


