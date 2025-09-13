import { Constructor } from "cc";
import { EquipmentPrototype } from "../Core/Prototype/EquipmentPrototype";

// 该文件用于管理游戏中的装备系统
const registry: Map<string, Constructor<EquipmentPrototype>> = new Map();
const registryReverse: Map<Constructor<EquipmentPrototype>,string> = new Map();

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
