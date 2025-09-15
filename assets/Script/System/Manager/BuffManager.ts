import { Constructor } from "cc";
import { BuffPrototype } from "../Core/Prototype/BuffPrototype";

// 该文件用于管理游戏中的Buff系统
const registry: Map<string, Constructor<BuffPrototype>> = new Map();
const registryReverse: Map<Constructor<BuffPrototype>,string> = new Map();
// 装备用品注册装饰器
export const RegisterBuff: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<BuffPrototype>);
        registryReverse.set(T as unknown as Constructor<BuffPrototype>, key);
    }
}

// 获取所有注册的装备原型key
export function getAllBuffKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取装备原型
export function getBuffPrototype(key: string): Constructor<BuffPrototype> | undefined {
    return registry.get(key);
}

// 根据装备原型或者实例获取key
export function getBuffKey(proto: Constructor<BuffPrototype>|BuffPrototype): string | undefined {
    if (proto instanceof BuffPrototype) {
            // @ts-ignore
            return registryReverse.get(proto.constructor);
        }
        return registryReverse.get(proto);
}
