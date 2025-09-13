import { SpriteFrame } from "cc";
import { EquipmentType } from "../../Manager/EquipmentManager";
import { EquipmentInstance } from "../Instance/EquipmentInstance";
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty";
import { BuffProgress, AttackProgress, FightProgress, DamageProgress, DeathProgress, HealProgress } from "../Progress/FightProgress";

export type EquipmentDTO = {
    lv: number,
    prototype: string,
    extraProperty: Partial<BasePrototypeProperty>,
}

export class EquipmentPrototype {
    // 名称信息
    public get name(): string { return "Equipment Name" }
    // 描述信息
    public get description(): string { return "Equipment Description" }
    // 装备类型
    public get type(): EquipmentType { return EquipmentType.Null }
    // 成长属性
    public readonly growProperty: BasePrototypeProperty = new BasePrototypeProperty();
    // 基础属性
    public readonly baseProperty: BasePrototypeProperty = new BasePrototypeProperty();
    // 保存对应的实例
    constructor(public readonly instance: EquipmentInstance) {
    }
    // 图标信息 Sprite
    public async icon(): Promise<SpriteFrame> {
        return Promise.resolve(null);
    }
}
