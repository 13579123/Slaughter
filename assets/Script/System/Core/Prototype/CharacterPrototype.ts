import { sp, SpriteFrame } from "cc";
import { CharacterEquipmentDTO, CharacterInstance } from "../Instance/CharacterInstance";
import { BasePrototypeProperty } from "../Property/BasePrototypeProperty";
import { BuffProgress, AttackProgress, FightProgress, DamageProgress, DeathProgress, HealProgress } from "../Progress/FightProgress";
import { EquipmentDTO } from "./EquipmentPrototype";
import { BuffDTO } from "./BuffPrototype";
import { SkillDTO } from "./SkillPrototype";
import { getComponentByPlayer } from "../../../Game/System/PlayerToPrefabMap";

export type CharacterDTO = {
    // 等级
    lv: number,
    prototype: string,
    // 增益信息
    buffs?: BuffDTO[],
    // 装备信息
    equipments?: CharacterEquipmentDTO,
    // 携带技能信息
    skills?: SkillDTO[],
    // 额外属性
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

export type AnimationConfig = {
    // 动画名称
    animations: {
        move: string,
        idle: string,
        die: string,
    },
}

export class CharacterPrototype implements FightProgress {
    // 名称信息
    public get name(): string { return "Character Name" }
    // 描述信息
    public get description(): string { return "Character Description" }
    // 成长属性
    public readonly growProperty: BasePrototypeProperty = new BasePrototypeProperty();
    // 基础属性
    public readonly baseProperty: BasePrototypeProperty = new BasePrototypeProperty();
    // 动画配置
    public get animation(): AnimationConfig {
        return {
            animations: {
                move: "Run",
                idle: "Idle",
                die: "Die"
            }
        }
    }
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
    // 攻击之前
    private attackAnimationPromise = null
    beforeAttack(progress: AttackProgress, next: Function) { 
        const prefab = getComponentByPlayer(this.instance)
        this.attackAnimationPromise = prefab.playAnimation("Attack01" , {
            count: 1 , 
            speed: this.instance.attackSpeed,
            frameEvent: {
                name: "Attack01",
                callback: () => {
                    next()
                }
            }
        })
        return
    }
    afterAttack(progress: AttackProgress, next: Function): void {
        if (this.attackAnimationPromise) this.attackAnimationPromise.then(next)
    }
}