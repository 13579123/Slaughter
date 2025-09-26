import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { achivementManager } from 'db://assets/Script/Game/Manager/AchivementManager';
import { RegisterAchivement } from 'db://assets/Script/Game/System/Manager/AchivementManager';
import { AchivementPrototype } from 'db://assets/Script/Game/System/Prototype/AchivementPrototype';
import { EquipmentDTO, EquipmentQuality } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { ItemDTO } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { Spear } from '../Equipment/BeginnerKit/Spear';
import { getEquipmentKey } from 'db://assets/Script/System/Manager/EquipmentManager';
import { createId } from 'db://assets/Script/Game/Share';
import { LeatherArmor } from '../Equipment/BeginnerKit/LeatherArmor';
import { LeatherShoes } from '../Equipment/BeginnerKit/LeatherShoes';
import { LeatherShoulder } from '../Equipment/BeginnerKit/LeatherShoulder';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
const { ccclass, property } = _decorator;

@RegisterLanguageEntry("Monopoly")
class LanguageEntryMonopoly extends LanguageEntry {
    public get chs(): string {
        return "大富翁"
    }
    public get eng(): string {
        return "Monopoly"
    }
    public get jpn(): string {
        return "大富翁"
    }
}

@RegisterLanguageEntry("Monopoly Description")
class LanguageEntryMonopolyDescription extends LanguageEntry {
    public get chs(): string {
        return "获取 100000 金币"
    }
    public get eng(): string {
        return "Get 100000 coins"
    }
    public get jpn(): string {
        return "100000 コインを獲得する"
    }
}

@RegisterAchivement("Monopoly")
export class Monopoly extends AchivementPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Monopoly").getValue(
            settingManager.data.language
        )
    }

    public get description(): string {
        return LanguageManager.getEntry("Monopoly Description").getValue(
            settingManager.data.language
        )
    }

    // 图标
    public async icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Achivement/Monopoly/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get progress(): { progress: number; maxProgress: number; } {
        return {
            progress: achivementManager.data.achivementData.resource.addGold,
            maxProgress: 100000
        };
    }

    public get rewards(): { gold: number; diamond: number; items?: ItemDTO[]; equipment?: EquipmentDTO[]; } {
        return {
            gold: 10000,
            diamond: 500,
            equipment: [
                {
                    prototype: getEquipmentKey(Spear),
                    lv: 1,
                    id: createId(),
                    quality: EquipmentQuality.Legendary,
                    extraProperty: {}
                },
                {
                    prototype: getEquipmentKey(LeatherArmor),
                    lv: 1,
                    id: createId(),
                    quality: EquipmentQuality.Legendary,
                    extraProperty: {}
                },
                {
                    prototype: getEquipmentKey(LeatherShoes),
                    lv: 1,
                    id: createId(),
                    quality: EquipmentQuality.Legendary,
                    extraProperty: {}
                },
                {
                    prototype: getEquipmentKey(LeatherArmor),
                    lv: 1,
                    id: createId(),
                    quality: EquipmentQuality.Legendary,
                    extraProperty: {}
                },
                {
                    prototype: getEquipmentKey(LeatherShoulder),
                    lv: 1,
                    id: createId(),
                    quality: EquipmentQuality.Legendary,
                    extraProperty: {}
                },
            ]
        }
    }

}


