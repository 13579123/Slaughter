import { Constructor } from "cc"
import { BuffInstance } from "../Instance/BuffInstance"
import { CharacterInstance } from "../Instance/CharacterInstance"
import { SkillInstance } from "../Instance/SkillInstance"
import { FromType, DamageType } from "../Prototype/CharacterPrototype"
import { BuffPrototype } from "../Prototype/BuffPrototype"

export class Progress {
    // 数据
    data: Map<string, any> = new Map
}

export class AttackProgress extends Progress {

    public from: CharacterInstance = null

    public target: CharacterInstance = null

    public critical: boolean = false

    public damageRateType = {
        physic: 1.0,
        magic: 0.2,
        light: 1.0,
        dark: 1.0,
        real: 0,
    }

}

export class DamageProgress extends Progress {

    public from: CharacterInstance = null

    public target: CharacterInstance = null

    public fromType: FromType = FromType.attack

    public damageType: DamageType = DamageType.physic

    public damage: number = 0

    public damageRate: number = 1.0

    public critical: boolean = false

}

export class BuffProgress extends Progress {

    public from: CharacterInstance = null

    public target: CharacterInstance = null

    public buff: Constructor<BuffPrototype>[] = []

}

export class DeathProgress extends Progress {

    public from: CharacterInstance = null

    public damage: number = 0 // 最终伤害

}

export class HealProgress extends Progress {

    public from: CharacterInstance = null

    public target: CharacterInstance = null

    public heal: number = 0

    public healRate: number = 1.0

    public fromType: FromType = FromType.skill

}

export class SkillProgress extends Progress {

    public from: CharacterInstance = null

    public skill: SkillInstance = null

    public cost = {
        hp: 0,
        mp: 0,
    }

    public coolTime: number = 0

    public type: "use"|"test" = "use" // 使用技能还是测试技能是否能用

}

export interface FightProgress {
    // 攻击之前
    beforeAttack?(progress: AttackProgress, next: Function): void,
    // 攻击之后
    afterAttack?(progress: AttackProgress, next: Function): void,
    // 受伤之前
    beforeDamage?(progress: DamageProgress, next: Function): void,
    // 受伤之后
    afterDamage?(progress: DamageProgress, next: Function): void,
    // 添加buff之前
    beforeAddBuff?(progress: BuffProgress, next: Function): void,
    // 添加buff之后
    afterAddBuff?(progress: BuffProgress, next: Function): void,
    // 移除buff之前
    beforeRemoveBuff?(progress: BuffProgress, next: Function): void,
    // 移除buff之后
    afterRemoveBuff?(progress: BuffProgress, next: Function): void,
    // 死亡之前
    beforeDeath?(progress: DeathProgress, next: Function): void,
    // 死亡之后
    afterDeath?(progress: DeathProgress, next: Function): void,
    // 治疗之前
    beforeHeal?(progress: HealProgress, next: Function): void,
    // 治疗之后
    afterHeal?(progress: HealProgress, next: Function): void,
    // 使用技能之前
    beforeUseSkill?(progress: SkillProgress, next: Function): void,
    // 使用技能之后
    afterUseSkill?(progress: SkillProgress, next: Function): void,
}
