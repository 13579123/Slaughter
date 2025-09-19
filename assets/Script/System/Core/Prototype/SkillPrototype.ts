import { log, SpriteFrame } from "cc";
import { EquipmentType } from "../../Core/Prototype/EquipmentPrototype";
import { EquipmentInstance } from "../Instance/EquipmentInstance";
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty";
import { BuffProgress, AttackProgress, FightProgress, DamageProgress, DeathProgress, HealProgress, SkillProgress } from "../Progress/FightProgress";
import { CharacterInstance } from "../Instance/CharacterInstance";
import { SkillInstance } from "../Instance/SkillInstance";

export type SkillDTO = {
    lv: number,
    prototype: string,
}

export enum SkillFailReason {
    NotEnoughCoast, // 消耗不足
    CoolDown, // 冷却中
}

export class SkillPrototype {
    // 名称信息
    public get name(): string { return "Equipment Name" }
    // 描述信息
    public get description(): string { return "Equipment Description" }
    // 技能消耗
    public get cost() {
        return {
            hp: 0,
            mp: 0,
        }
    }
    // 技能冷却
    public get coolTime() {
        return 15
    }
    // 学习消耗
    public get learnCost() {
        return {
            gold: 0,
            diamond: 0
        }
    }
    // 保存对应的实例
    constructor(public readonly instance: SkillInstance) {
    }
    // 图标信息 Sprite
    public async icon(): Promise<SpriteFrame> {
        return Promise.resolve(null);
    }
    // 技能使用失败回调
    public useFail(reason: SkillFailReason, progress: SkillProgress) {
        if (reason == SkillFailReason.NotEnoughCoast) {
            log("消耗不足", progress.cost)
        } else if (reason == SkillFailReason.CoolDown) {
            log("冷却中" + (progress.coolTime / 1000).toFixed(2) + "s")
        }
    }
    // 使用技能回调
    public use(useOption: {
        use: CharacterInstance,
    }) {
    }
    // 创建原型实例的回调
    public onCreate() {}
}
