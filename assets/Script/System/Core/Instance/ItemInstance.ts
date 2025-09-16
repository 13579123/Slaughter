import { Constructor } from "cc";
import { ItemPrototype } from "../Prototype/ItemPrototype";
import { createId } from "../../../Game/Share";

export type ItemInstanceOption = {
    // 物品数量
    count: number,
    // 对应的原型构造器
    Proto: Constructor<ItemPrototype>,
}

export class ItemInstance {

    public readonly count: number = 0

    public readonly proto: ItemPrototype = null

    public constructor(option: ItemInstanceOption) {
        this.count = option.count
        this.proto = new option.Proto(this)
    }

}
