import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Script/Module/CcNative';
import { LanguageEntry } from 'db://assets/Script/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Script/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("LeatherArmor")
class LeatherArmor_Entry extends LanguageEntry {
    public get chs(): string { return "皮甲" }
    public get eng(): string { return "Leather Armor" }
    public get jpn(): string { return "レザーアーマー" }
}

@RegisterLanguageEntry("LeatherArmor Description")
class LeatherArmor_Description_Entry extends LanguageEntry {
    public get chs(): string { return "精皮制的皮甲" }
    public get eng(): string { return "A pair of ordinary leather shoes" }
    public get jpn(): string { return "精皮製のレザーシューズ" }
}

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("LeatherArmor")
export class LeatherArmor extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("LeatherArmor")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("LeatherArmor Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Armor;
    }

    public get suit(): string {
        return "BeginnerKit"
    }

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `${
            LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
            }: <color=${getQualityColor(this.instance.quality)}>${LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
            }</color>\n`
        res += this.instance.maxHp > 0 ? `${LanguageManager.getEntry("maxHp")
            .getValue(settingManager.data.language)
            }: ${this.instance.maxHp.toFixed(1)}\n` : ""
        res += `${LanguageManager.getEntry("physicalDefense")
            .getValue(settingManager.data.language)
            }: ${this.instance.physicalDefense.toFixed(1)}\n`
        res += `${LanguageManager.getEntry("magicDefense")
            .getValue(settingManager.data.language)
            }: ${this.instance.magicDefense.toFixed(1)}\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit).getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${LanguageManager.getEntry("maxHp")
            .getValue(settingManager.data.language)
            }: +50${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${LanguageManager.getEntry("physicalDefense")
                .getValue(settingManager.data.language)
            }: +5\n${LanguageManager.getEntry("magicDefense")
                .getValue(settingManager.data.language)
            }: +5${this.suitCount >= twoSuit ? `</color>` : ""}\n`
        return res
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalDefense: 5,
        magicDefense: 5,
    }).setProperty("maxHp", (hp) => {
        return hp + (this.suitCount >= oneSuit ? 50 : 0)
    }).setProperty("physicalDefense", (defense) => {
        return defense + (this.suitCount >= twoSuit ? 5 : 0)
    }).setProperty("magicDefense", (defense) => {
        return defense + (this.suitCount >= twoSuit ? 5 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalDefense: 1.5,
        magicDefense: 1.5,
    })

    // icon图标
    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/BeginnerKit/LeatherArmor/spriteFrame", SpriteFrame)).value)
        })
    }

}


