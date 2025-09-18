import { SpriteFrame } from "cc"
import { BuffInstance } from "../Instance/BuffInstance"
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty"
import { AttackProgress , BuffProgress, DamageProgress, DeathProgress, FightProgress, HealProgress } from "../Progress/FightProgress"

export type BuffDTO = {
    prototype: string,
    extraProperty?: Partial<BasePrototypeProperty>,
}

export class BuffPrototype {
    // 名称信息
    public get name(): string { return "Buff Name" }
    // 描述信息
    public get description(): string { return "Buff Description" }
    // 保存对应的实例
    constructor(public readonly instance: BuffInstance) {
    }
    // 图标信息 Sprite
    public async icon(): Promise<SpriteFrame> {
        return Promise.resolve(null);
    }
    // 被添加时的回调
    public onAdd() {
    }
    // 被移除时的回调
    public onRemove() {
    }
    // 每一帧回调
    public tick(dt: number) {
    }
}
