import { AllLanguageType, LanguageType } from "../../Module/Language/LangaugeType";
import { CharacterDTO } from "../../System/Core/Prototype/CharacterPrototype";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { Manager } from "../../System/Manager";
import { getCharacterKey } from "../../System/Manager/CharacterManager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";
import { error } from "cc";
import { ItemInstance } from "../../System/Core/Instance/ItemInstance";
import { getItemKey } from "../../System/Manager/ItemManager";

class BackpackDTO {

    public items: ItemDTO[] = []

    constructor(data?: BackpackData) {
        if (data) {
            this.items = data.items
        }
    }

}

class BackpackData {

    public items: ItemDTO[] = [
        {prototype: "Stone" , count: 25}
    ]

    constructor(data?: BackpackDTO) {
        if (data) {
            this.items = data.items
        }
    }

    public useItem(instance: ItemInstance , count: number) {
        instance.proto.use(count)
    }

    public reduceCount(itemKey: string , count: number) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.prototype === itemKey) {
                item.count -= count
                if (item.count <= 0) item.count = 0
                return
            }
        }
        return
    }

    public addCount(itemKey: string , count: number) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.prototype === itemKey) {
                item.count += count
                return
            }
        }
        this.items.push({prototype: itemKey , count: count})
    }

}

export const backpackManager = new Manager({
    storageKey: "slaughter:game:backpack",
    descrypt: Config.descrypt,
    Constructor: BackpackData,
    DtoCostructor: BackpackDTO,
})

try {
    // @ts-ignore
    window.backpackManager = backpackManager
} catch(e) {
}