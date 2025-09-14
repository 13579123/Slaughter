import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Script/Module/CcNative';
import { LanguageEntry } from 'db://assets/Script/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Script/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("Spear")
class Spear_Entry extends LanguageEntry {
    public get chs(): string { return "长矛" }
    public get eng(): string { return "Spear" }
    public get jpn(): string { return "槍" }
}

@RegisterLanguageEntry("Spear Description")
class Spear_Description_Entry extends LanguageEntry {
    public get chs(): string { return "一把普通的木矛" }
    public get eng(): string { return "A common wooden spear" }
    public get jpn(): string { return "普通の木の槍" }
}

@RegisterEquipment("Spear")
export class Spear extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Spear").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("Spear Description").getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Weapon;
    }

    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        attackSpeed: 1.3,
        physicalAttack: 15,
    })

    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/Spear/spriteFrame", SpriteFrame)).value)
        })
    }

}


