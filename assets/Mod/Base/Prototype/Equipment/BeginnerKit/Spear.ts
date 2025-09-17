import { SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { BasePrototypeProperty } from 'db://assets/Script/System/Core/Property/BasePrototypeProperty';
import { EquipmentPrototype, EquipmentType, getQualityColor, getQualityName } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
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

// 套装效果 所需数量1 所需数量2
const oneSuit = 2, twoSuit = 4

@RegisterEquipment("Spear")
export class Spear extends EquipmentPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Spear")
            .getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("Spear Description")
            .getValue(settingManager.data.language);
    }

    public get type(): EquipmentType {
        return EquipmentType.Weapon;
    }

    public get suit(): string {
        return "BeginnerKit"
    }

    public get propertyDescription(): string {
        let res = ""
        // 基础属性
        res += `${LanguageManager.getEntry("Quality").getValue(settingManager.data.language)
        }: <color=${getQualityColor(this.instance.quality)}>${
            LanguageManager.getEntry(getQualityName(this.instance.quality)).getValue(settingManager.data.language)
        }</color>\n`
        res += `${LanguageManager.getEntry("physicalAttack")
                .getValue(settingManager.data.language)
            }: ${this.instance.physicalAttack.toFixed(1)}\n`
        res += `${LanguageManager.getEntry("attackSpeed")
                .getValue(settingManager.data.language)
            }: ${this.instance.attackSpeed.toFixed(1)}\n`
        // 套装属性
        const suitEntryStr = LanguageManager.getEntry(this.suit).getValue(settingManager.data.language)
        res += `\n${this.suitCount >= oneSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${oneSuit}): ${LanguageManager.getEntry("physicalAttack")
                .getValue(settingManager.data.language)
            }: +15${this.suitCount >= oneSuit ? `</color>` : ""}\n`
        res += `${this.suitCount >= twoSuit ? `<color=#00ff00>` : ""}${suitEntryStr}(${twoSuit}): ${LanguageManager.getEntry("attackSpeed")
                .getValue(settingManager.data.language)
            }: +0.1${this.suitCount >= twoSuit ? `</color>` : ""}\n`

        return res
    }

    // 基础属性
    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalAttack: 15,
        attackSpeed: 1.3,
    }).setProperty("physicalAttack", (atk) => {
        return atk + (this.suitCount >= oneSuit ? 15 : 0)
    }).setProperty("attackSpeed", (speed) => {
        return speed + (this.suitCount >= twoSuit ? 0.1 : 0)
    })

    // 成长属性
    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        physicalAttack: 3,
    })

    public icon(): Promise<SpriteFrame> {
        return new Promise<SpriteFrame>(async (res) => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Equipment/BeginnerKit/Spear/spriteFrame", SpriteFrame)).value)
        })
    }

}


