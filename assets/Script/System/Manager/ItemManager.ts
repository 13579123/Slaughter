import { Constructor } from "cc";
import { ItemPrototype } from "../Core/Prototype/ItemPrototype";

export enum MedicineType {
    HpMedicine,
    MpMedicine,
}

// 该文件用于管理游戏中的物品系统
const registry: Map<string, Constructor<ItemPrototype>> = new Map();
const registryReverse: Map<Constructor<ItemPrototype>,string> = new Map();

// 注册为物品
export const RegisterItem: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<ItemPrototype>);
        registryReverse.set(T as unknown as Constructor<ItemPrototype>, key);
    }
}

// 获取所有注册的物品原型key
export function getAllItemKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取物品原型
export function getItemPrototype(key: string): Constructor<ItemPrototype> | undefined {
    return registry.get(key);
}

// 根据Item原型或者实例获取key
export function getItemKey(proto: Constructor<ItemPrototype>|ItemPrototype): string | undefined {
    if (proto instanceof ItemPrototype) {
        // @ts-ignore
        return registryReverse.get(proto.constructor);
    }
    return registryReverse.get(proto);
}

// 该文件用于管理游戏中的药品系统
const medicineRegistry: Map<string, Constructor<ItemPrototype>> = new Map();
const medicineRegistryReverse: Map<Constructor<ItemPrototype>,string> = new Map();

// 获取所有注册的药品原型key
export function getAllMedicineItemKeys(): string[] {
    return Array.from(medicineRegistry.keys());
}

// 根据key获取药品原型
export function getMedicineItemPrototype(key: string): Constructor<ItemPrototype> | undefined {
    return medicineRegistry.get(key);
}

// 根据药品原型或者实例获取key
export function getMedicineItemKey(proto: Constructor<ItemPrototype>|ItemPrototype): string | undefined {
    if (proto instanceof ItemPrototype) {
        // @ts-ignore
        return medicineRegistryReverse.get(proto.constructor);
    }
    return medicineRegistryReverse.get(proto);
}

// 注册药品
export const RegisterMedicine: (k: string , type: MedicineType) => ClassDecorator = (key: string, type: MedicineType) => {
    return (T) => {
        medicineRegistry.set(key, T as unknown as Constructor<ItemPrototype>);
        medicineRegistryReverse.set(T as unknown as Constructor<ItemPrototype>, key);
    }
}