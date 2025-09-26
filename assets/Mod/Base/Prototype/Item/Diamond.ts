import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { ItemPrototype } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { getItemKey, RegisterItem } from 'db://assets/Script/System/Manager/ItemManager';
const { ccclass, property } = _decorator;

@RegisterLanguageEntry("Diamond")
class Brave_Entry extends LanguageEntry {
    public get chs(): string { return "钻石" }
    public get eng(): string { return "Diamond" }
    public get jpn(): string { return "ダイヤモンド" }
}

@RegisterLanguageEntry("Diamond Description")
class Brave_Description_Entry extends LanguageEntry {
    public get chs(): string { return "用于购买的高级货币" }
    public get eng(): string { return "Used to purchase advanced currency" }
    public get jpn(): string { return "上級貨幣を購入するために使用されます" }
}

@RegisterItem("Diamond")
export class Diamond extends ItemPrototype {

    public get name(): string { return LanguageManager.getEntry("Diamond").getValue(settingManager.data.language) }

    public get description(): string {
        return LanguageManager.getEntry("Diamond Description").getValue(settingManager.data.language)
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Item/Diamond/spriteFrame" , SpriteFrame , true)).value)
        })
    }

    public get canUse(): boolean {
        return false
    }

}


