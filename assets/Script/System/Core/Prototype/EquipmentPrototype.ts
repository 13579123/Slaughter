import { SpriteFrame } from "cc";
import { EquipmentInstance } from "../Instance/EquipmentInstance";
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty";
import { BuffProgress, AttackProgress, FightProgress, DamageProgress, DeathProgress, HealProgress } from "../Progress/FightProgress";

export type EquipmentDTO = {
    id: string,
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

// 装备品质
export function getQualityName(quality: EquipmentQuality): string {
    switch (quality) {
        case EquipmentQuality.Ordinary: return "Ordinary";
        case EquipmentQuality.Fine: return "Fine";
        case EquipmentQuality.Rare: return "Rare";
        case EquipmentQuality.Epic: return "Epic";
        case EquipmentQuality.Legendary: return "Legendary";
        case EquipmentQuality.Mythic: return "Mythic";
    }
}

// 装备颜色
export function getQualityColor(quality: EquipmentQuality): string {
    switch (quality) {
        case EquipmentQuality.Ordinary: return "#ffffff";
        case EquipmentQuality.Fine: return "#7af87aff";
        case EquipmentQuality.Rare: return "#6191f9ff";
        case EquipmentQuality.Epic: return "#cc6afdff";
        case EquipmentQuality.Legendary: return "#f5cc6dff";
        case EquipmentQuality.Mythic: return "#f5695fff";
    }
}

export class EquipmentPrototype {
    // 名称信息
    public get name(): string { return "Equipment Name" }
    // 描述信息
    public get description(): string { return "Equipment Description" }
    // 装备类型
    public get type(): EquipmentType { return EquipmentType.Null }
    // 装备属性展示
    public get propertyDescription(): string { return "" }
    // 套装名称
    public get suit(): string { return "" }
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
    // 获取同套装备数量
    public get suitCount(): number {
        let suit = 0
        if (this.instance.character && this.suit) {
            Object.keys(this.instance.character.equipments).forEach((key) => {
                if (this.instance.character.equipments[key]) {
                    if (this.instance.character.equipments[key].proto.suit === this.suit)
                        suit += 1
                }
            })
        }
        return suit
    }
}
