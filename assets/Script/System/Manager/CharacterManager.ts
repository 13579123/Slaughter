import { Constructor } from "cc";
import { BuffPrototype } from "../Core/Prototype/BuffPrototype";
import { CharacterPrototype } from "../Core/Prototype/CharacterPrototype";

// 该文件用于管理游戏中的角色系统
const registry: Map<string, Constructor<CharacterPrototype>> = new Map();
const registryReverse: Map<Constructor<CharacterPrototype>, string> = new Map();

// 装备用品注册装饰器
export const RegisterCharacter: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<CharacterPrototype>);
        registryReverse.set(T as unknown as Constructor<CharacterPrototype>, key);
    }
}

// 获取所有注册的装备原型key
export function getAllCharacterKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取装备原型
export function getCharacterPrototype(key: string): Constructor<CharacterPrototype> | undefined {
    return registry.get(key);
}

// 根据装备原型或者实例获取key
export function getCharacterKey(proto: Constructor<CharacterPrototype>): string | undefined {
    if (proto instanceof CharacterPrototype) {
        // @ts-ignore
        return registryReverse.get(proto.constructor);
    }
    return registryReverse.get(proto);
}
