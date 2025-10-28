import { Constructor, warn } from "cc"
import { CharacterPrototype, FromType, DamageType } from "../Prototype/CharacterPrototype"
import { CharacterInstanceProperty } from "../Property/CharacterInstanceProperty"
import { EquipmentInstance } from "./EquipmentInstance"
import { BaseInstanceProperty } from "../Property/BaseInstanceProperty"
import { EquipmentDTO } from "../Prototype/EquipmentPrototype"
import { getEquipmentPrototype } from "../../Manager/EquipmentManager"
import { BuffDTO, BuffPrototype } from "../Prototype/BuffPrototype"
import { BuffInstance } from "./BuffInstance"
import { getBuffPrototype } from "../../Manager/BuffManager"
import { BuffProgress, AttackProgress, FightProgress, Progress, DamageProgress, DeathProgress, HealProgress, SkillProgress } from "../Progress/FightProgress"
import { darkDamage, lightDamage, magicDamage, physicalDamage } from "../Calculation/DamageCalculation"
import { SkillInstance } from "./SkillInstance"
import { SkillDTO, SkillFailReason } from "../Prototype/SkillPrototype"
import { getSkillPrototype } from "../../Manager/SkillManager"
import { createId } from "../../../Game/Share"

export type CharacterInstanceOption = {
    // 等级
    lv?: number,
    // 增益信息
    buffs?: BuffDTO[],
    // 装备信息
    equipments?: CharacterEquipmentDTO,
    // 携带技能信息
    skills?: SkillDTO[],
    // 额外属性
    extraProperty?: Partial<BaseInstanceProperty>,
    // 对应的原型构造器
    Proto: Constructor<CharacterPrototype>,
}

export enum CharacterEvent {
    ReduceHp = "ReduceHp", // 生命值减少
    IncreaseHp = "IncreaseHp", // 生命值增加
    ReduceMp = "ReduceMp", // 魔法值减少
    IncreaseMp = "IncreaseMp", // 魔法值增加
    BeDamage = "BeDamage", // 被伤害
    BeHeal = "BeHeal", // 被治疗
    HpToZero = "HpToZero", // 生命值归零事件(归0不代表死亡)
    Death = "Death", // 死亡事件
}

export type CharacterEquipmentDTO = {
    armor?: EquipmentDTO,
    shoes?: EquipmentDTO,
    weapon?: EquipmentDTO,
    accessory?: EquipmentDTO,
}

export class CharacterInstance extends CharacterInstanceProperty {

    // 事件代码
    protected eventMap = new Map<string, Set<Function>>()
    public on(e: CharacterEvent, callback: Function) {
        let set = this.eventMap.get(e)
        if (!set) this.eventMap.set(e, set = new Set)
        set.add(callback)
    }
    public off(e: CharacterEvent, callback?: Function) {
        if (!callback) {
            this.eventMap.delete(e)
            return
        }
        this.eventMap.get(e)?.delete(callback)
    }
    public emit(e: CharacterEvent, ...arg: any[]) {
        const set = this.eventMap.get(e)
        if (!set) return
        set.forEach(c => c(...arg))
    }

    // 构造器
    public constructor(option: CharacterInstanceOption) {
        super()
        this.lv = option.lv || 1
        this.proto = new option.Proto(this)
        if (option.buffs) this.initBuffs(option.buffs)
        if (option.equipments) this.initEquipments(option.equipments)
        if (option.skills) this.initSkills(option.skills)
        if (option.extraProperty) this.extraProperty = option.extraProperty
    }

    // 初始化装备
    protected initEquipments(equipments: CharacterEquipmentDTO) {
        Object.keys(equipments).forEach((k: keyof CharacterEquipmentDTO) => {
            const dto = equipments[k]
            if (!dto) return
            const Proto = getEquipmentPrototype(dto.prototype)
            if (Proto) {
                this.equipments[k] = new EquipmentInstance({
                    id: dto.id,
                    lv: dto.lv,
                    character: this,
                    quality: dto.quality,
                    extraProperty: dto.extraProperty,
                    Proto
                })
            } else warn(`Can not found equipment by prototype key: ${dto.prototype}`)
        })
    }

    // 初始化buff
    protected initBuffs(buffs: BuffDTO[]) {
        const list = buffs.map(dto => {
            const Proto = getBuffPrototype(dto.prototype)
            if (Proto) {
                const instance = new BuffInstance({
                    Proto,
                    extraProperty: dto.extraProperty,
                })
                return instance
            }
            else warn(`Can not found buff by prototype key: ${dto.prototype}`)
        })
        this.buffs.push(...list)
    }

    // 初始化技能
    protected initSkills(skills: SkillDTO[]) {
        const list = skills.map(dto => {
            const Proto = getSkillPrototype(dto.prototype)
            if (Proto) {
                const skill = new SkillInstance({
                    characterInstance: this,
                    lv: dto.lv,
                    Proto
                })
                setTimeout(() => skill.proto.onCreate())
                return skill
            }
            else warn(`Can not found skill by prototype key: ${dto.prototype}`)
        })
        this.skills.push(...list)
    }

    // 触发战斗流程事件
    public async emitProgress(e: keyof FightProgress, progress: Progress) {
        return new Promise(async res => {
            let hasNext = false
            progress.next = () => {
                hasNext = true
                res(null)
            }
            // 角色生效
            if (!hasNext) {
                await new Promise(res => {
                    if (this.proto[e])
                        this.proto[e](progress as any, res)
                    else res(null)
                })
            }
            // 装备生效
            const keys = Object.keys(this.equipments) as (keyof CharacterEquipmentDTO)[]
            for (let i = 0; i < keys.length; i++) {
                if (hasNext) break
                const equipment = this.equipments[keys[i]];
                if (equipment) {
                    await new Promise(res => {
                        const callback = equipment.proto[e]
                        if (callback) callback(progress as any, res)
                        else res(null)
                    })
                }
            }
            // buff 生效
            for (let i = 0; i < this.buffs.length; i++) {
                if (hasNext) break
                const buff = this.buffs[i]
                await new Promise(res => {
                    const callback = buff.proto[e]
                    if (callback) callback(progress as any, res)
                    else res(null)
                })
            }
            res(null)
        })
    }

    // 是否已经死亡
    protected _hasDeath = false
    public get hasDeath() {
        return this._hasDeath
    }

    // 进入预死亡阶段
    public _preDeath = false

    // 尝试死亡
    public death(option: {
        damage: number,
        from: CharacterInstance,
    }) {
        if (this._hasDeath || this._preDeath) return
        this._preDeath = true
        const progress = new DeathProgress()
        progress.from = option.from
        progress.damage = option.damage
        this.emitProgress("beforeDeath", progress)
            .then(async () => {
                this._preDeath = false
                if (this.hp > 0) return
                this._hasDeath = true;
                (new Promise(res => {
                    this.proto.playDieAnimation(progress , () => {} , res)
                })).then(async () => {
                    this.emit(CharacterEvent.Death , option)
                })
                await this.emitProgress("afterDeath", progress)
            })
    }

    // 添加buff
    public addBuff(option: {
        data?: { [key: string]: number },
        target?: CharacterInstance,
        from?: CharacterInstance,
        extraProperty?: Partial<BaseInstanceProperty>,
        Proto: Constructor<BuffPrototype>
    }) {
        if (this._hasDeath || this._preDeath) return
        const progress = new BuffProgress()
        progress.target = option.target || this
        progress.from = option.from || this
        progress.buff.push(option.Proto)
        progress.target.emitProgress("beforeAddBuff", progress).then(async () => {
            progress.buff.forEach(proto => {
                const buff = new BuffInstance({
                    Proto: proto,
                    character: progress.target,
                    extraProperty: option.extraProperty,
                })
                if (option.data) {
                    Object.keys(option.data)
                        .forEach(k => buff.data.set(k, option.data[k]))
                }
                progress.target.buffs.push(buff)
                buff.proto.onAdd()
            })
            await progress.target.emitProgress("afterAddBuff", progress)
        })
        return
    }

    // 移除buff
    public removeBuff(option: {
        target?: CharacterInstance,
        from?: CharacterInstance,
        Proto: Constructor<BuffPrototype>,
    }) {
        if (this._hasDeath || this._preDeath) return
        const progress = new BuffProgress()
        progress.target = option.target || this
        progress.from = option.from || this
        progress.buff = [option.Proto]
        progress.target.emitProgress("beforeRemoveBuff", progress)
            .then(() => {
                progress.buff.forEach(b => {
                    for (let i = 0; i < progress.target.buffs.length; i++) {
                        const buff = progress.target.buffs[i];
                        if (buff.proto.constructor === b) {
                            progress.target.buffs.splice(i, 1)
                            buff.proto.onRemove()
                            return
                        }
                    }
                })
                return progress.target.emitProgress("afterRemoveBuff", progress)
            }).finally(() => {
            })
        return
    }

    // 减少生命值(纯粹减少)
    public reduceHp(option: {
        reduce: number,
        type: DamageType,
        from: CharacterInstance,
        fromType: FromType,
        critical: boolean,
    }) {
        if (this._hasDeath || this._preDeath) return
        this.hp = ((this.maxHp * this.hp) - option.reduce) / this.maxHp
        this.emit(CharacterEvent.ReduceHp, option)
        if (this.hp <= 0) {
            this.hp = 0
            this.emit(CharacterEvent.HpToZero, option)
            // 尝试死亡
            this.death({ from: option.from , damage: option.reduce })
        }
    }

    // 增加生命值(纯粹增加)
    public increaseHp(option: {
        increase: number,
        from?: CharacterInstance,
        fromType?: FromType
    }) {
        if (this._hasDeath || this._preDeath) return
        option.from = option.from || this
        option.fromType = option.fromType || FromType.skill
        this.hp = ((this.maxHp * this.hp) + option.increase) / this.maxHp
        this.emit(CharacterEvent.IncreaseHp, option)
    }

    // 减少生魔法值(纯粹减少)
    public reduceMp(option: {
        reduce: number,
        from: CharacterInstance,
    }) {
        if (this._hasDeath || this._preDeath) return
        this.mp = ((this.maxMp * this.mp) - option.reduce) / this.maxMp
        this.emit(CharacterEvent.ReduceMp, option)
    }

    // 增加魔法值(纯粹增加)
    public increaseMp(option: {
        increase: number,
        from?: CharacterInstance,
        fromType?: FromType
    }) {
        if (this._hasDeath || this._preDeath) return
        option.from = option.from || this
        option.fromType = option.fromType || FromType.skill
        this.mp = ((this.maxMp * this.mp) + option.increase) / this.maxMp
        this.emit(CharacterEvent.IncreaseMp, option)
    }

    // 伤害角色
    public beDamage(option: {
        atk: number,
        type: DamageType,
        from: CharacterInstance,
        fromType: FromType,
        critical?: boolean,
    }) {
        if (this._hasDeath || this._preDeath) return
        const progress = new DamageProgress()
        progress.damage = option.atk
        progress.from = option.from
        progress.target = this
        progress.fromType = option.fromType
        progress.damageType = option.type
        progress.damageRate = 1.0
        progress.critical = option.critical || false
        this.emitProgress("beforeDamage", progress)
            .then(async () => {
                const damage = progress.damage * progress.damageRate
                if (progress.damageType === DamageType.physic) {
                    progress.target.reduceHp({
                        reduce: physicalDamage(
                            damage,
                            progress.from.physicalPenetration,
                            progress.target.physicalDefense
                        ),
                        from: progress.from,
                        type: progress.damageType,
                        fromType: progress.fromType,
                        critical: progress.critical
                    })
                } else if (progress.damageType === DamageType.magic) {
                    progress.target.reduceHp({
                        reduce: magicDamage(
                            damage,
                            progress.from.magicPenetration,
                            progress.target.magicDefense
                        ),
                        from: progress.from,
                        type: progress.damageType,
                        fromType: progress.fromType,
                        critical: progress.critical
                    })
                } else if (progress.damageType === DamageType.light) {
                    progress.target.reduceHp({
                        reduce: lightDamage(
                            damage,
                            progress.target.lightResistance,
                            progress.target.darkResistance,
                        ),
                        from: progress.from,
                        type: progress.damageType,
                        fromType: progress.fromType,
                        critical: progress.critical
                    })
                } else if (progress.damageType === DamageType.dark) {
                    progress.target.reduceHp({
                        reduce: darkDamage(
                            damage,
                            progress.target.darkResistance,
                            progress.target.lightResistance
                        ),
                        from: progress.from,
                        type: progress.damageType,
                        fromType: progress.fromType,
                        critical: progress.critical
                    })
                } else if (progress.damageType === DamageType.real) {
                    progress.target.reduceHp({
                        reduce: damage,
                        from: progress.from,
                        type: progress.damageType,
                        fromType: progress.fromType,
                        critical: progress.critical
                    })
                }
                this.emit(CharacterEvent.BeDamage, progress)
                await this.emitProgress("afterDamage", progress)
            }).finally(() => {
            })
        return
    }

    // 治疗角色
    public beHeal(option: {
        heal: number,
        from: CharacterInstance,
        fromType: FromType
    }) {
        if (this._hasDeath || this._preDeath) return
        const progress = new HealProgress()
        progress.heal = option.heal
        progress.from = option.from
        progress.target = this
        progress.healRate = 1.0
        progress.fromType = option.fromType
        this.emitProgress("beforeHeal", progress)
            .then(() => {
                this.increaseHp({
                    increase: progress.heal,
                    from: progress.from,
                    fromType: progress.fromType
                })
                this.emit(CharacterEvent.BeHeal, progress)
                this.emitProgress("afterHeal", progress)
            })
    }

    // 普通攻击某一个角色
    public attackCharacter(option: {
        target: CharacterInstance,
        animationComplete?: (progress: AttackProgress) => void
    }) {
        if (this._hasDeath || this._preDeath) {
            option.animationComplete && option.animationComplete(new AttackProgress())
            return
        }
        // 流程
        const progress = new AttackProgress()
        progress.from = this
        progress.target = option.target

        // 是否暴击
        progress.critical = this.criticalRate > Math.random()
        return this.emitProgress("beforeAttack", progress)
            .then(async () => {
                await new Promise(res => {
                    progress.from.proto.playAttackAnimation(progress , () => {
                        option.animationComplete && option.animationComplete(progress)
                    } , res)
                })
                // 伤害浮动和暴击伤害
                const damageRate = (Math.random() * 0.2 + 0.9) * (
                    progress.critical ? progress.from.criticalDamage : 1
                )
                // 基础物理伤害
                progress.target.beDamage({
                    atk: (progress.from.physicalAttack * progress.damageRateType.physic) * damageRate,
                    type: DamageType.physic,
                    from: progress.from,
                    fromType: FromType.attack,
                    critical: progress.critical
                })
                // 基础魔法伤害
                progress.target.beDamage({
                    atk: progress.from.magicAttack * progress.damageRateType.magic * damageRate,
                    type: DamageType.magic,
                    from: progress.from,
                    fromType: FromType.attack,
                    critical: progress.critical
                })
                // 基础光伤害
                progress.target.beDamage({
                    atk: progress.from.lightAttack * progress.damageRateType.light,
                    type: DamageType.light,
                    from: progress.from,
                    fromType: FromType.attack,
                    critical: false
                })
                // 基础暗伤害
                progress.target.beDamage({
                    atk: progress.from.darkAttack * progress.damageRateType.dark,
                    type: DamageType.dark,
                    from: progress.from,
                    fromType: FromType.attack,
                    critical: false
                })
                await this.emitProgress("afterAttack", progress)
            })
    }

    // 判断技能是否可用
    public async isSkillAble(skill: SkillInstance, progress?: SkillProgress): Promise<boolean> {
        // 流程
        if (!progress) {
            progress = new SkillProgress()
            progress.from = this
            progress.skill = skill
            progress.type = "test"
            progress.cost = skill.proto.cost
            progress.coolTime = skill.coolTime
        }
        return new Promise((res) => {
            this.emitProgress("beforeUseSkill", progress)
                .then(() => {
                    if (progress.cost.hp > progress.from.hp * progress.from.maxHp) {
                        progress.skill.proto.useFail(SkillFailReason.NotEnoughCoast, progress)
                        return res(false)
                    }
                    // console.log(progress.cost.mp , progress.from.mp * progress.from.maxMp)
                    if (progress.cost.mp > progress.from.mp * progress.from.maxMp) {
                        progress.skill.proto.useFail(SkillFailReason.NotEnoughCoast, progress)
                        return res(false)
                    }
                    if (progress.skill.coolTime > 0) {
                        progress.skill.proto.useFail(SkillFailReason.CoolDown, progress)
                        return res(false)
                    }
                    res(true)
                })
        })
    }

    // 使用技能
    public useSkill(option: {
        skill: SkillInstance,
        useAble?: () => void,
        animationComplete?: () => void
    }) {
        if (this._hasDeath || this._preDeath) {
            option.animationComplete && option.animationComplete()
            return
        }
        const progress = new SkillProgress()
        progress.from = this
        progress.skill = option.skill
        progress.type = "use"
        progress.cost = progress.skill.proto.cost
        progress.coolTime = progress.skill.proto.coolTime
        this.isSkillAble(option.skill, progress)
            .then(async able => {
                if (!able) return option.animationComplete && option.animationComplete()
                if (option.useAble) option.useAble()
                await new Promise(res => {
                    progress.from.proto.playSkillAnimation(progress , () => {
                        option.animationComplete && option.animationComplete()
                    } , res)
                })
                await progress.skill.proto.use({ use: progress.from })
                progress.from.reduceMp({ reduce: progress.cost.mp, from: progress.from })
                progress.from.reduceHp({
                    reduce: progress.cost.hp,
                    type: DamageType.real,
                    from: progress.from,
                    fromType: FromType.skillCost,
                    critical: false
                })
                // 计算冷却缩减后的冷却
                progress.skill.coolTime = progress.coolTime
                await this.emitProgress("afterUseSkill", progress)
            })
        return
    }

    // 添加额外属性
    public addProperty(property: Partial<BaseInstanceProperty>) {
        Object.keys(property).forEach(key => {
            this.extraProperty[key] = (property[key] || 0) + (this.extraProperty[key] || 0)
        })
    }

}
1