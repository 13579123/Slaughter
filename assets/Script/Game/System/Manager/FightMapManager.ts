import { Constructor, director } from "cc";
import { FightMapInstance } from "../Instance/FightMapInstance";
import { FightMapPrototype } from "../Prototype/FightMapPrototype";
import { Rx } from "db://assets/Module/Rx";
import { BasePrototypeProperty } from "../../../System/Core/Property/BasePrototypeProperty";

// 该文件用于管理游戏中的角色系统
const registry: Map<string, Constructor<FightMapPrototype>> = new Map();
const registryReverse: Map<Constructor<FightMapPrototype>, string> = new Map();

// 装备用品注册装饰器
export const RegisterFightMap: (k: string) => ClassDecorator = (key: string) => {
    return (T) => {
        registry.set(key, T as unknown as Constructor<FightMapPrototype>);
        registryReverse.set(T as unknown as Constructor<FightMapPrototype>, key);
    }
}

// 获取所有注册的战斗原型key
export function getAllFightMapKeys(): string[] {
    return Array.from(registry.keys());
}

// 根据key获取战斗原型
export function getFightMapPrototype(key: string): Constructor<FightMapPrototype> | undefined {
    return registry.get(key);
}

// 根据战斗原型或者实例获取key
export function getFightMapKey(proto: Constructor<FightMapPrototype> | FightMapPrototype): string | undefined {
    if (proto instanceof FightMapPrototype) {
        // @ts-ignore
        return registryReverse.get(proto.constructor);
    }
    return registryReverse.get(proto);
}

let instance: FightMapInstance;

export function getFightMapInstance(): FightMapInstance {
    return instance;
}

export type EnterFightMapOptions = {
    // 玩家额外属性
    playerExtraProperty?: Partial<BasePrototypeProperty>,
    // 玩家额外百分比属性
    playerExtraPercentProperty?: Partial<BasePrototypeProperty>,
    // 怪物额外属性
    monsterExtraProperty?: Partial<BasePrototypeProperty>,
    // 怪物额外百分比属性
    monsterExtraPercentProperty?: Partial<BasePrototypeProperty>,
}

export function enterFightMap(id: string, options: EnterFightMapOptions = {}) {
    instance = Rx.reactive(new FightMapInstance(getFightMapPrototype(id) , options))
    instance.init()
    director.loadScene("Map");
}

// @ts-ignore
window.enterFightMap = enterFightMap