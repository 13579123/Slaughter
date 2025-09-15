import { Constructor } from "cc";
import { MapEventPrototype } from "../Core/Prototype/MapEventPrototype";

// 该文件用于管理游戏中的战斗地图系统
const registry: Map<string, Constructor<MapEventPrototype>> = new Map();
const registryReverse: Map<Constructor<MapEventPrototype>,string> = new Map();
// 装备用品注册装饰器
export const RegisterMapEvent: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<MapEventPrototype>);
        registryReverse.set(T as unknown as Constructor<MapEventPrototype>, key);
    }
}

// 获取所有注册的装备原型key
export function getAllMapEventKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取装备原型
export function getMapEventPrototype(key: string): Constructor<MapEventPrototype> | undefined {
    return registry.get(key);
}

// 根据装备原型或者实例获取key
export function getMapEventKey(proto: Constructor<MapEventPrototype>|MapEventPrototype): string | undefined {
    if (proto instanceof MapEventPrototype) {
            // @ts-ignore
            return registryReverse.get(proto.constructor);
        }
        return registryReverse.get(proto);
}
