import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("LeatherShoes")
class LeatherShoes_Entry extends LanguageEntry {
    public get chs(): string { return "皮鞋" }
    public get eng(): string { return "Leather Shoes" }
    public get jpn(): string { return "レザーシューズ" }
}

@RegisterLanguageEntry("LeatherShoes Description")
class LeatherShoes_Description_Entry extends LanguageEntry {
    public get chs(): string { return "一双普通的皮鞋" }
    public get eng(): string { return "A pair of ordinary leather shoes" }
    public get jpn(): string { return "普通のレザーシューズ" }
}

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("LeatherShoes")
export class LeatherShoes extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("LeatherShoes")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("LeatherShoes Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Shoes;
    }

    public get suit(): string {
        return "BeginnerKit"
    }

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `Lv: ${this.instance.lv}\n${
            LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
            }: <color=${getQualityColor(this.instance.quality)}>${
                LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
            }</color>\n`
        res += this.instance.maxHp > 0 ? `${LanguageManager.getEntry("maxHp")
            .getValue(settingManager.data.language)
            }: ${this.instance.maxHp.toFixed(1)}\n` : ""
        res += `${LanguageManager.getEntry("physicalDefense")
            .getValue(settingManager.data.language)
            }: ${this.instance.physicalDefense.toFixed(1)}\n`
        res += `${LanguageManager.getEntry("darkResistance")
            .getValue(settingManager.data.language)
            }: ${this.instance.darkResistance.toFixed(1)}\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit).getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${LanguageManager.getEntry("maxHp")
                .getValue(settingManager.data.language)
            }: +40${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${LanguageManager.getEntry("physicalDefense")
                .getValue(settingManager.data.language)
            }: +5${this.suitCount >= twoSuit ? `</color>` : ""}\n`

        return res
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalDefense: 4,
        darkResistance: 2,
    }).setProperty("maxHp", (hp) => {
        return hp + (this.suitCount >= oneSuit ? 40 : 0)
    }).setProperty("physicalDefense", (pd) => {
        return pd + (this.suitCount >= twoSuit ? 5 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalDefense: 2,
        darkResistance: 0.5,
    })

    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/BeginnerKit/LeatherShoes/spriteFrame", SpriteFrame)).value)
        })
    }

}