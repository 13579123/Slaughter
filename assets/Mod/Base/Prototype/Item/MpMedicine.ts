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

@RegisterLanguageEntry("MpMedicine")
class Entry extends LanguageEntry {
    public get chs(): string { return "魔法药水" }
    public get eng(): string { return "MpMedicine" }
    public get jpn(): string { return "MpMedicine" }
}

@RegisterLanguageEntry("MpMedicine Description")
class Description_Entry extends LanguageEntry {
    public get chs(): string { return "回复300魔法值" }
    public get eng(): string { return "Recover 300 MP" }
    public get jpn(): string { return "Recover 300MP" }
}

@RegisterItem("MpMedicine")
@RegisterMedicine("MpMedicine" , MedicineType.MpMedicine)
export class MpMedicine extends ItemPrototype {

    public get name(): string { return LanguageManager.getEntry("MpMedicine").getValue(settingManager.data.language) }

    public get description(): string {
        return LanguageManager.getEntry("MpMedicine Description").getValue(settingManager.data.language)
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Item/MpMedicine/spriteFrame" , SpriteFrame , true)).value)
        })
    }

    public get canUse(): boolean {
        return false
    }

    public use(number: number) {
        const fightInstance = getFightMapInstance()
        if (!fightInstance) return
        fightInstance.player.increaseMp({increase: 300 , fromType: FromType.medicine})
        backpackManager.data.reduceCount(getItemKey(MpMedicine) , number)
        backpackManager.save()
    }

}