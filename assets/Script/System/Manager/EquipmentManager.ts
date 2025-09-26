import { Constructor } from "cc";
import { EquipmentDTO, EquipmentPrototype } from "../Core/Prototype/EquipmentPrototype";
import { ItemDTO } from "../Core/Prototype/ItemPrototype";

// 材料
export type Material = {
    gold: number, // 金币
    diamond: number, // 钻石
    items?: ItemDTO[] // 物品
}

// 该文件用于管理游戏中的装备系统
const registry: Map<string, Constructor<EquipmentPrototype>> = new Map();
const registryReverse: Map<Constructor<EquipmentPrototype>, string> = new Map();

// 保存装备强化材料
const StrongMaterialRegistry: Map<string, (lv: number) => Material> = new Map()
const DecomposeMaterialRegistry: Map<string, (lv: number) => Material> = new Map()

// 装备用品注册装饰器
export const RegisterEquipment: (
    k: string , 
    strongMaterial?: (lv: number) => Material ,
    decomposeMaterial?: (lv: number) => Material,
) => ClassDecorator = (key: string , strongMaterial?: (lv: number) => Material , decomposeMaterial?: (lv: number) => Material) =>{
    return (T) => {
        registry.set(key, T as unknown as Constructor<EquipmentPrototype>);
        registryReverse.set(T as unknown as Constructor<EquipmentPrototype>, key);
        if (strongMaterial) {
            StrongMaterialRegistry.set(key, strongMaterial);
        }
        if (decomposeMaterial) {
            DecomposeMaterialRegistry.set(key, decomposeMaterial);
        }
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
export function getEquipmentKey(proto: Constructor<EquipmentPrototype> | EquipmentPrototype): string | undefined {
    if (proto instanceof EquipmentPrototype) {
        // @ts-ignore
        return registryReverse.get(proto.constructor);
    }
    return registryReverse.get(proto);
}

// 获取装备强化材料
export function getStrongMaterial(prototype: string , lv: number): Material | null {
    const fn = StrongMaterialRegistry.get(prototype)
    if (!fn) return null
    return fn(lv)
}

// 获取装备分解材料
export function getDecomposeMaterial(prototype: string , lv: number): Material | null {
    const fn = DecomposeMaterialRegistry.get(prototype)
    if (!fn) return null
    return fn(lv)
}