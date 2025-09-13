import { Constructor } from "cc"
import { BuffPrototype } from "../Prototype/BuffPrototype"
import { BaseInstanceProperty } from "../Property/BaseInstanceProperty"

type BuffInstanceOption = {
    // 额外属性
    extraProperty?: Partial<BaseInstanceProperty>,
    Proto: Constructor<BuffPrototype>,
}

export class BuffInstance {

    // 数据区域
    public readonly data: Map<string , number> = new Map

    // 对应的原型
    public readonly proto: BuffPrototype = null

    // 额外属性
    public extraProperty: Partial<BaseInstanceProperty> = {}

    // 构造器
    public constructor(option: BuffInstanceOption) {
        this.proto = new option.Proto(this)
        if (option.extraProperty) this.extraProperty = option.extraProperty
    }

}
