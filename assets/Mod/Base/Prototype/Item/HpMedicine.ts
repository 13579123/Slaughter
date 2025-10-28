import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { backpackManager } from 'db://assets/Script/Game/Manager/BackpackManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { ItemPrototype } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { getItemKey, MedicineType, RegisterItem, RegisterMedicine } from 'db://assets/Script/System/Manager/ItemManager';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { getAllEquipmentKeys, getEquipmentKey } from 'db://assets/Script/System/Manager/EquipmentManager';
import { Spear } from '../Equipment/BeginnerKit/Spear';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
import { FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
const { ccclass, property } = _decorator;

@RegisterLanguageEntry("HpMedicine")
class Entry extends LanguageEntry {
    public get chs(): string { return "治疗药水" }
    public get eng(): string { return "HpMedicine" }
    public get jpn(): string { return "HpMedicine" }
}

@RegisterLanguageEntry("HpMedicine Description")
class Description_Entry extends LanguageEntry {
    public get chs(): string { return "回复300生命值" }
    public get eng(): string { return "Recover 300 HP" }
    public get jpn(): string { return "Recover 300 HP" }
}

@RegisterItem("HpMedicine")
@RegisterMedicine("HpMedicine" , MedicineType.HpMedicine)
export class HpMedicine extends ItemPrototype {

    public get name(): string { return LanguageManager.getEntry("HpMedicine").getValue(settingManager.data.language) }

    public get description(): string {
        return LanguageManager.getEntry("HpMedicine Description").getValue(settingManager.data.language)
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Item/HpMedicine/spriteFrame" , SpriteFrame , true)).value)
        })
    }

    public get canUse(): boolean {
        return false
    }

    public use(number: number) {
        const fightInstance = getFightMapInstance()
        if (!fightInstance) return
        fightInstance.player.increaseHp({increase: 300 , fromType: FromType.medicine})
        backpackManager.data.reduceCount(getItemKey(HpMedicine) , number)
        backpackManager.save()
    }

}