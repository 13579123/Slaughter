import { BaseEventManagerData, Manager } from "../../System/Manager";
import { Config } from "../Config";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";
import { ItemInstance } from "../../System/Core/Instance/ItemInstance";
import { getItemPrototype, getMedicineItemKey } from "../../System/Manager/ItemManager";
import { HpMedicine } from "db://assets/Mod/Base/Prototype/Item/HpMedicine";

type EventType = "addItem"|"reduceItem"|"useItem"

class BackpackDTO {

    public items: ItemDTO[] = []

    constructor(data?: BackpackData) {
        if (data) {
            this.items = data.items
        }
    }

}

export class BackpackData extends BaseEventManagerData<EventType> {

    public items: ItemDTO[] = [
        {prototype: "Stone" , count: 25} ,
        {prototype: getMedicineItemKey(HpMedicine) , count: 30}
    ]

    constructor(data?: BackpackDTO) {
        super()
        if (data) {
            // 剔除数量为0或者不存在物品
            this.items = data.items.filter(i => i && i.count > 0 && getItemPrototype(i.prototype))
        }
    }

    public useItem(instance: ItemInstance , count: number) {
        instance.proto.use(count)
        this.emit("useItem" , instance)
    }

    public reduceCount(itemKey: string , count: number) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.prototype === itemKey) {
                item.count -= count
                if (item.count <= 0) {
                    this.items.splice(i , 1)
                }
                this.emit("reduceItem" , item)
                return
            }
        }
        return
    }

    public addItem(itemKey: string , count: number) {
        if (!itemKey || !getItemPrototype(itemKey)) return
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.prototype === itemKey) {
                item.count += count
                this.emit("addItem" , item)
                return item
            }
        }
        const item = {prototype: itemKey , count: count}
        this.items.push(item)
        this.emit("addItem" , item)
        return item
    }

    public hasItem(itemKey: string , count: number) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.prototype === itemKey) {
                return item.count >= count
            }
        }
        return false
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