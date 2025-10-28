import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { RegisterEquipment } from 'db://assets/Script/System/Manager/EquipmentManager';

@RegisterLanguageEntry("SealingBelt")
class SealingBelt_Entry extends LanguageEntry {
    public get chs(): string { return "封印腰带" }
    public get eng(): string { return "Sealing Belt" }
    public get jpn(): string { return "封印ベルト" }
}

@RegisterLanguageEntry("SealingBelt Description")
class SealingBelt_Description_Entry extends LanguageEntry {
    public get chs(): string { return "靠近点，似乎能听到前主人的惨叫" }
    public get eng(): string { return "Ordinary Sealing Belt" }
    public get jpn(): string { return "普通の封印ベルト" }
}

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("SealingBelt")
export class SealingBelt extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("SealingBelt")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("SealingBelt Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Accessory;
    }

    public get suit(): string {
        return "Sealing"
    }

    // icon图标
    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/Sealing/SealingBelt/spriteFrame", SpriteFrame)).value)
        })
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxMp: 50,
        criticalRate: 0.05,
        magicPenetration: 5,
    }).setProperty("criticalRate", (critical) => {
        return critical +
            Math.floor(this.instance.lv / 3) / 100 +
            (this.suitCount >= twoSuit ? 0.05 : 0)
    }).setProperty("magicPenetration", (magicPenetration) => {
        return magicPenetration +
            (this.suitCount >= oneSuit ? 5 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxMp: 10,
        magicPenetration: 1,
    })

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `Lv: ${this.instance.lv}\n${LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
            }: <color=${getQualityColor(this.instance.quality)}>${LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
            }</color>\n`
        res += `${LanguageManager.getEntry("maxMp")
            .getValue(settingManager.data.language)
            }: ${(this.instance.maxMp).toFixed(0)}\n`
        res += `${LanguageManager.getEntry("magicPenetration")
            .getValue(settingManager.data.language)
            }: ${this.instance.magicPenetration.toFixed(2)}\n`
        res += `${LanguageManager.getEntry("criticalRate")
            .getValue(settingManager.data.language)
            }: ${(this.instance.criticalRate * 100).toFixed(2)}%\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit)
            .getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${LanguageManager.getEntry("magicPenetration")
                .getValue(settingManager.data.language)
            }: +5${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${LanguageManager.getEntry("criticalRate")
                .getValue(settingManager.data.language)
            }: +5%${this.suitCount >= twoSuit ? `</color>` : ""}\n`
        return res
    }

}