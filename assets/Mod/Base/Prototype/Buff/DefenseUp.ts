import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { BuffPrototype } from 'db://assets/Script/System/Core/Prototype/BuffPrototype';
import { RegisterBuff } from 'db://assets/Script/System/Manager/BuffManager';
import { Normal } from 'db://assets/Script/System/Normal';
const { ccclass, property } = _decorator;

@RegisterLanguageEntry("DefenseUp")
class DefenseUp_Entry extends LanguageEntry {
    public get chs(): string { return "防御提升" }
    public get eng(): string { return "Defense Up" }
    public get jpn(): string { return "防御提升" }
}

@RegisterLanguageEntry("DefenseUp Description")
class DefenseUp_Description_Entry extends LanguageEntry {
    public get chs(): string {
        let result = ''
        result += `物理防御 +${Normal.number(this.data.physicalDefense)}\n`
        result += `魔法防御 +${Normal.number(this.data.magicDefense)}\n`
        return result
    }
    public get eng(): string {
        let result = ''
        result += `Physical Defense +${Normal.number(this.data.physicalDefense)}\n`
        result += `Magic Defense +${Normal.number(this.data.magicDefense)}\n`
        return result
    }
    public get jpn(): string {
        let result = ''
        result += `物理防御 +${Normal.number(this.data.physicalDefense)}\n`
        result += `魔法防御 +${Normal.number(this.data.magicDefense)}\n`
        return result
    }
}

@RegisterBuff("DefenseUp")
export class DefenseUp extends BuffPrototype {

    public get name(): string {
        return LanguageManager.getEntry("DefenseUp").getValue(settingManager.data.language)
    }

    public get description(): string {
        return LanguageManager.getEntry("DefenseUp Description").getValue(
            settingManager.data.language , this.instance.extraProperty
        )
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Buff/defenseUp/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public onAdd(): void {
    }

}


