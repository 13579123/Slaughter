import { sp, SpriteFrame } from "cc";
import { CharacterEquipmentDTO, CharacterInstance } from "../Instance/CharacterInstance";
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty";
import { BuffProgress, AttackProgress, FightProgress, DamageProgress, DeathProgress, HealProgress } from "../Progress/FightProgress";
import { EquipmentDTO } from "./EquipmentPrototype";
import { BuffDTO } from "./BuffPrototype";
import { SkillDTO } from "./SkillPrototype";

export type CharacterDTO = {
    // 等级
    lv: number,
    prototype: string,
    // 增益信息
    buffs: BuffDTO[],
    // 装备信息
    equipments: CharacterEquipmentDTO,
    // 携带技能信息
    skills: SkillDTO[],

    extraProperty: Partial<BasePrototypeProperty>,
}

export enum DamageType {
    physic = "physic",
    magic = "magic",
    light = "light",
    dark = "dark",
    real = "real",
}

export enum FromType {
    // 被攻击造成
    attack = "attack",
    // 被技能造成
    skill = "skill",
    // 被buff造成
    buff = "buff",
    // 被技能消耗
    skillCost = "skillCost"
}

export class CharacterPrototype {
    // 名称信息
    public get name(): string { return "Character Name" }
    // 描述信息
    public get description(): string { return "Character Description" }
    // 成长属性
    public readonly growProperty: BasePrototypeProperty = new BasePrototypeProperty();
    // 基础属性
    public readonly baseProperty: BasePrototypeProperty = new BasePrototypeProperty();
    // 保存对应的实例
    constructor(public readonly instance: CharacterInstance) {
    }
    // 头像信息 Sprite
    public async icon(): Promise<SpriteFrame> {
        return Promise.resolve(null);
    }
    // spine动画信息
    public async skeletonData(): Promise<sp.SkeletonData> {
        return Promise.resolve(null);
    }
}