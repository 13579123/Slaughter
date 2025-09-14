import { SpriteFrame } from "cc";
import { EquipmentInstance } from "../Instance/EquipmentInstance";
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty";
import { BuffProgress, AttackProgress, FightProgress, DamageProgress, DeathProgress, HealProgress } from "../Progress/FightProgress";

export type EquipmentDTO = {
    lv: number,
    quality: EquipmentQuality,
    prototype: string,
    extraProperty: Partial<BasePrototypeProperty>,
}

// 装备品质
export enum EquipmentQuality {
    Ordinary = 0, // 普通
    Fine = 1,       // 精良
    Rare = 2,       // 稀有
    Epic = 3,       // 史诗
    Legendary = 4, // 传说
    Mythic = 5,     // 神话
}

// 装备类型
export enum EquipmentType {
    Weapon = "weapon",
    Armor = "armor",
    Shoes = "shoes",
    Accessory = "accessory",
    Null = "null",
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
