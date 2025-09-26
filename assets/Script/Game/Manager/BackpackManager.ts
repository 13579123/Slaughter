import { BaseEventManagerData, Manager } from "../../System/Manager";
import { Config } from "../Config";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";
import { ItemInstance } from "../../System/Core/Instance/ItemInstance";

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
        {prototype: "Stone" , count: 25}
    ]

    constructor(data?: BackpackDTO) {
        super()
        if (data) {
            this.items = data.items
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
                    item.count = 0
                }
                this.emit("reduceItem" , item)
                return
            }
        }
        return
    }

    public addItem(itemKey: string , count: number) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.prototype === itemKey) {
                item.count += count
                this.emit("addItem" , item)
                return
            }
        }
        const item = {prototype: itemKey , count: count}
        this.items.push(item)
        this.emit("addItem" , item)
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