import { Constructor } from "cc";
import { EquipmentPrototype } from "../Core/Prototype/EquipmentPrototype";

// 该文件用于管理游戏中的装备系统
const registry: Map<string, Constructor<EquipmentPrototype>> = new Map();
const registryReverse: Map<Constructor<EquipmentPrototype>,string> = new Map();

// 装备类型
export enum EquipmentType {
    Weapon = "weapon",
    Armor = "armor",
    Shoes = "shoes",
    Accessory = "accessory",
    Null = "null",
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

// 装备用品注册装饰器
export const RegisterEquipment: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<EquipmentPrototype>);
        registryReverse.set(T as unknown as Constructor<EquipmentPrototype>, key);
    }
}

// 获取所有注册的装备原型key
export function getAllEquipmentKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取装备原型
export function getEquipmentPrototype(key: string): Constructor<EquipmentPrototype> | undefined {
    return registry.get(key);
}

// 根据装备原型或者实例获取key
export function getEquipmentKey(proto: Constructor<EquipmentPrototype>): string | undefined {
    return registryReverse.get(proto);
}
