import { Constructor } from "cc"
import { MapEventPrototype } from "../Prototype/MapEventPrototype"

export type MapEventInstanceOption = {
    // 对应的原型构造器
    Proto: Constructor<MapEventPrototype>,
}

export class MapEventInstance {

    public readonly proto: MapEventPrototype = null

    public constructor(option: MapEventInstanceOption) {
        this.proto = new option.Proto(this)
    }

}


