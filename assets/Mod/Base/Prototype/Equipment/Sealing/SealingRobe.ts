import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("SealingRobe")
class SealingRobe_Entry extends LanguageEntry {
    public get chs(): string { return "封印长袍" }
    public get eng(): string { return "Sealing Robe" }
    public get jpn(): string { return "封印ローブ" }
}

@RegisterLanguageEntry("SealingRobe Description")
class SealingRobe_Description_Entry extends LanguageEntry {
    public get chs(): string { return "衣服上面还有点汗味混着点...血腥味？" }
    public get eng(): string { return "Ordinary Sealing Robe" }
    public get jpn(): string { return "普通の封印ローブ" }
}

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("SealingRobe")
export class SealingRobe extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("SealingRobe")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("SealingRobe Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Armor;
    }

    public get suit(): string {
        return "Sealing"
    }

    // icon图标
    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/Sealing/SealingRobe/spriteFrame", SpriteFrame)).value)
        })
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 30,
        maxMp: 20,
        magicDefense: 3,
        physicalDefense: 3,
    }).setProperty("magicDefense", (magicDefense) => {
        return magicDefense + (this.suitCount >= oneSuit ? 3 : 0) + (this.suitCount >= twoSuit ? 3 : 0)
    }).setProperty("physicalDefense", (physicalDefense) => {
        return physicalDefense + (this.suitCount >= oneSuit ? 3 : 0) + (this.suitCount >= twoSuit ? 3 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 5,
        maxMp: 5,
        magicDefense: 1,
        physicalDefense: 1,
    })

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `Lv: ${this.instance.lv}\n${LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
            }: <color=${getQualityColor(this.instance.quality)}>${LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
            }</color>\n`
        res += `${LanguageManager.getEntry("magicDefense")
            .getValue(settingManager.data.language)
            }: ${(this.instance.magicDefense).toFixed(0)}\n`
        res += `${LanguageManager.getEntry("physicalDefense")
            .getValue(settingManager.data.language)
            }: ${(this.instance.physicalDefense).toFixed(0)}\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit)
            .getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${LanguageManager.getEntry("magicDefense")
            .getValue(settingManager.data.language)
            }: +3 ${LanguageManager.getEntry("physicalDefense")
            .getValue(settingManager.data.language)
            }: +3 ${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${LanguageManager.getEntry("magicDefense")
            .getValue(settingManager.data.language)
            }: +6 ${LanguageManager.getEntry("physicalDefense")
            .getValue(settingManager.data.language)
            }: +6 ${this.suitCount >= twoSuit ? `</color>` : ""}\n`
        return res
    }

}