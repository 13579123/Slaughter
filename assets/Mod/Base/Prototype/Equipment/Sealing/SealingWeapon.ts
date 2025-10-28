import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("SealingWeapon")
class Entry extends LanguageEntry {
    public get chs(): string { return "封印法杖" }
    public get eng(): string { return "Sealing Staff" }
    public get jpn(): string { return "封印の杖" }
}

@RegisterLanguageEntry("SealingWeapon Description")
class Description_Entry extends LanguageEntry {
    public get chs(): string { return "这法杖还挺沉的，也足够锋利" }
    public get eng(): string { return "This staff is quite heavy and sharp enough." }
    public get jpn(): string { return "この杖は重くて十分鋭い" }
}

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("SealingWeapon")
export class SealingWeapon extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("SealingWeapon")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("SealingWeapon Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Weapon;
    }

    public get suit(): string {
        return "Sealing"
    }

    // icon图标
    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/Sealing/SealingWeapon/spriteFrame", SpriteFrame)).value)
        })
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalAttack: 5,
        magicAttack: 25,
        attackSpeed: 1.15
    }).setProperty("physicalAttack", (physicalAttack) => {
        return physicalAttack + (this.suitCount >= oneSuit ? 5 : 0)
    }).setProperty("magicAttack", (magicAttack) => {
        return magicAttack + (this.suitCount >= oneSuit ? 15 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalAttack: 2,
        magicAttack: 7,
    })

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `Lv: ${this.instance.lv}\n${LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
            }: <color=${getQualityColor(this.instance.quality)}>${LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
            }</color>\n`
        res += `${LanguageManager.getEntry("physicalAttack")
            .getValue(settingManager.data.language)
            }: ${(this.instance.physicalAttack).toFixed(0)}\n`
        res += `${LanguageManager.getEntry("magicAttack")
            .getValue(settingManager.data.language)
            }: ${(this.instance.magicAttack).toFixed(0)}\n`
        res += `${LanguageManager.getEntry("attackSpeed")
            .getValue(settingManager.data.language)
            }: ${(this.instance.attackSpeed).toFixed(2)}\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit)
            .getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${LanguageManager.getEntry("physicalAttack")
            .getValue(settingManager.data.language)
            }: +5${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${LanguageManager.getEntry("magicAttack")
            .getValue(settingManager.data.language)
            }: +15${this.suitCount >= twoSuit ? `</color>` : ""}\n`
        return res
    }

}