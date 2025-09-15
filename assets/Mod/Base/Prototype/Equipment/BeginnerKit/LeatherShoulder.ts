import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Script/Module/CcNative';
import { LanguageEntry } from 'db://assets/Script/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Script/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("LeatherShoulder")
class LeatherShoes_Entry extends LanguageEntry {
    public get chs(): string { return "皮肩" }
    public get eng(): string { return "Leather Shoulder" }
    public get jpn(): string { return "レザーショルダー" }
}

@RegisterLanguageEntry("LeatherShoulder Description")
class LeatherShoes_Description_Entry extends LanguageEntry {
    public get chs(): string { return "普通皮肩" }
    public get eng(): string { return "Ordinary Leather Shoulder" }
    public get jpn(): string { return "普通のレザーショルダー" }
}

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("LeatherShoulder")
export class LeatherShoulder extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("LeatherShoulder")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("LeatherShoulder Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Accessory;
    }

    public get suit(): string {
        return "BeginnerKit"
    }

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `${
            LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
        }: <color=${getQualityColor(this.instance.quality)}>${
            LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
        }</color>\n`
        res += `${LanguageManager.getEntry("physicalPenetration")
            .getValue(settingManager.data.language)
            }: ${this.instance.physicalPenetration.toFixed(2)}\n`
        res += `${LanguageManager.getEntry("criticalRate")
            .getValue(settingManager.data.language)
            }: ${(this.instance.criticalRate * 100).toFixed(2)}%\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit)
            .getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${
            LanguageManager.getEntry("physicalPenetration")
                .getValue(settingManager.data.language)
            }: +5${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${
            LanguageManager.getEntry("criticalRate")
                .getValue(settingManager.data.language)
            }: +5%${this.suitCount >= twoSuit ? `</color>` : ""}\n`
        return res
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        criticalRate: 0.05,
        physicalPenetration: 5,
    }).setProperty("criticalRate", (critical) => {
        return critical +
            Math.floor(this.instance.lv / 3) / 10 +
            (this.suitCount >= twoSuit ? 0.05 : 0)
    }).setProperty("physicalPenetration", (physicalPenetration) => {
        return physicalPenetration +
            (this.suitCount >= oneSuit ? 5 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalPenetration: 2,
    })

    // icon图标
    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/BeginnerKit/LeatherShoulder/spriteFrame", SpriteFrame)).value)
        })
    }

}


