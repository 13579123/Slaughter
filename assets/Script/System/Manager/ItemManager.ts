import { Constructor } from "cc";
import { ItemPrototype } from "../Core/Prototype/ItemPrototype";

// 该文件用于管理游戏中的装备系统
const registry: Map<string, Constructor<ItemPrototype>> = new Map();
const registryReverse: Map<Constructor<ItemPrototype>,string> = new Map();

// 装备用品注册装饰器
export const RegisterItem: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<ItemPrototype>);
        registryReverse.set(T as unknown as Constructor<ItemPrototype>, key);
    }
}

// 获取所有注册的装备原型key
export function getAllItemKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取装备原型
export function getItemPrototype(key: string): Constructor<ItemPrototype> | undefined {
    return registry.get(key);
}

// 根据装备原型或者实例获取key
export function getItemKey(proto: Constructor<ItemPrototype>|ItemPrototype): string | undefined {
    if (proto instanceof ItemPrototype) {
        // @ts-ignore
        return registryReverse.get(proto.constructor);
    }
    return registryReverse.get(proto);
}
