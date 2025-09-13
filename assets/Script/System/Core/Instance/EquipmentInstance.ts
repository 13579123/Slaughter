import { Constructor } from "cc";
import { EquipmentPrototype, EquipmentQuality } from "../Prototype/EquipmentPrototype";
import { EquipmentInstanceProperty } from "../Property/EquipmentInstanceProperty";
import { CharacterInstance } from "./CharacterInstance";
import { BaseInstanceProperty } from "../Property/BaseInstanceProperty";

export type EquipmentInstanceOption = {
    // 等级
    lv?: number,
    // 质量
    quality?: EquipmentQuality, // 品质范围 0 - 5
    // 对应的角色
    character?: CharacterInstance,
    // 额外属性
    extraProperty?: Partial<BaseInstanceProperty>,
    // 对应的原型构造器
    Proto: Constructor<EquipmentPrototype>,
}

export class EquipmentInstance extends EquipmentInstanceProperty{

    // 对应的角色
    public readonly character: CharacterInstance = null

    constructor(option: EquipmentInstanceOption) {
        super()
        this.lv = option.lv || 1
        this.proto = new option.Proto(this)
        this.character = option.character || null
        if (option.extraProperty) this.extraProperty = option.extraProperty
    }

}
