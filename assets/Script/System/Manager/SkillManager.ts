import { Constructor } from "cc";
import { BuffPrototype } from "../Core/Prototype/BuffPrototype";
import { SkillPrototype } from "../Core/Prototype/SkillPrototype";

// 该文件用于管理游戏中的技能系统
const registry: Map<string, Constructor<SkillPrototype>> = new Map();
const registryReverse: Map<Constructor<SkillPrototype>,string> = new Map();

// 装备用品注册装饰器
export const RegisterSkill: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<SkillPrototype>);
        registryReverse.set(T as unknown as Constructor<SkillPrototype>, key);
    }
}

// 获取所有注册的装备原型key
export function getAllSkillKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取装备原型
export function getSkillPrototype(key: string): Constructor<SkillPrototype> | undefined {
    return registry.get(key);
}

// 根据装备原型或者实例获取key
export function getSkillKey(proto: Constructor<SkillPrototype>): string | undefined {
    return registryReverse.get(proto);
}
