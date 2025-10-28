import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { backpackManager } from 'db://assets/Script/Game/Manager/BackpackManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { ItemPrototype } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { getItemKey, RegisterItem } from 'db://assets/Script/System/Manager/ItemManager';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { getAllEquipmentKeys, getEquipmentKey } from 'db://assets/Script/System/Manager/EquipmentManager';
import { Spear } from '../Equipment/BeginnerKit/Spear';
const { ccclass, property } = _decorator;

@RegisterLanguageEntry("Stone")
class Brave_Entry extends LanguageEntry {
    public get chs(): string { return "石头" }
    public get eng(): string { return "Stone" }
    public get jpn(): string { return "石です" }
}

@RegisterLanguageEntry("Stone Description")
class Brave_Description_Entry extends LanguageEntry {
    public get chs(): string { return "似乎没有什么用处" }
    public get eng(): string { return "Seems to be useless" }
    public get jpn(): string { return "何の役にも立たないようです" }
}

@RegisterItem("Stone")
export class Stone extends ItemPrototype {

    public get name(): string { return LanguageManager.getEntry("Stone").getValue(settingManager.data.language) }

    public get description(): string {
        return LanguageManager.getEntry("Stone Description").getValue(settingManager.data.language)
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Item/Stone/spriteFrame" , SpriteFrame , true)).value)
        })
    }

    public get canUse(): boolean {
        return true
    }

    public use(number: number) {
        const equipmentKey = getAllEquipmentKeys()[Math.floor(Math.random() * getAllEquipmentKeys().length)]
        equipmentManager.data.addEquipment(equipmentKey)
        backpackManager.data.reduceCount(getItemKey(Stone) , number)
        backpackManager.save()
        equipmentManager.save()
    }

}


