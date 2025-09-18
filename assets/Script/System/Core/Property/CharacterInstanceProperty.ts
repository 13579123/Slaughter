import { BuffInstance } from '../Instance/BuffInstance';
import { EquipmentInstance } from '../Instance/EquipmentInstance';
import { SkillInstance } from '../Instance/SkillInstance';
import { CharacterPrototype } from '../Prototype/CharacterPrototype';
import { EquipmentDTO } from '../Prototype/EquipmentPrototype';
import { BaseInstanceProperty } from './BaseInstanceProperty';

type CharacterEquipment = {
    armor: EquipmentInstance,
    shoes: EquipmentInstance,
    weapon: EquipmentInstance,
    accessory: EquipmentInstance,
}

export class CharacterInstanceProperty extends BaseInstanceProperty {

    // 对应的原型
    public proto: CharacterPrototype = null

    // buff列表
    public buffs: BuffInstance[] = []

    // 技能列表
    public skills: SkillInstance[] = []

    // 装备列表
    public equipments: CharacterEquipment = {
        armor: null,
        shoes: null,
        weapon: null,
        accessory: null,
    }
    
    // 额外属性
    public extraProperty: Partial<BaseInstanceProperty> = {}

    // 当前生命值
    protected _hp: number = 1 // 生命值范围 0 - 1
    public get hp(): number {
        return this._hp;
    }
    public set hp(value: number) {
        this._hp = Math.min(Math.max(value, 0), 1)
    }
    
    // 当前魔法值
    protected _mp: number = 1// 魔法值范围 0 - 1
    public get mp(): number {
        return this._mp;
    }
    public set mp(value: number) {
        this._mp = Math.min(Math.max(value, 0), 1)
    }

    
    // 最大生命值
    public get maxHp(): number {
        const base = this.proto.baseProperty.maxHp 
        const grow = this.proto.growProperty.maxHp * (this.lv - 1)
        const extra = this.extraProperty.maxHp || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.maxHp : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.maxHp ? sum + bf.extraProperty.maxHp : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 最大魔法值
    public get maxMp(): number {
        const base = this.proto.baseProperty.maxMp 
        const grow = this.proto.growProperty.maxMp * (this.lv - 1)
        const extra = this.extraProperty.maxMp || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.maxMp : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.maxMp ? sum + bf.extraProperty.maxMp : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 物理攻击力
    public get physicalAttack(): number {
        const base = this.proto.baseProperty.physicalAttack 
        const grow = this.proto.growProperty.physicalAttack * (this.lv - 1)
        const extra = this.extraProperty.physicalAttack || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.physicalAttack : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.physicalAttack ? sum + bf.extraProperty.physicalAttack : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 魔法攻击力
    public get magicAttack(): number {
        const base = this.proto.baseProperty.magicAttack 
        const grow = this.proto.growProperty.magicAttack * (this.lv - 1)
        const extra = this.extraProperty.magicAttack || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.magicAttack : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.magicAttack ? sum + bf.extraProperty.magicAttack : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 光属性攻击力
    public get lightAttack(): number {
        const base = this.proto.baseProperty.lightAttack 
        const grow = this.proto.growProperty.lightAttack * (this.lv - 1)
        const extra = this.extraProperty.lightAttack || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.lightAttack : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.lightAttack ? sum + bf.extraProperty.lightAttack : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 暗属性攻击力
    public get darkAttack(): number {
        const base = this.proto.baseProperty.darkAttack 
        const grow = this.proto.growProperty.darkAttack * (this.lv - 1)
        const extra = this.extraProperty.darkAttack || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.darkAttack : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.darkAttack ? sum + bf.extraProperty.darkAttack : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 物理防御力
    public get physicalDefense(): number {
        const base = this.proto.baseProperty.physicalDefense 
        const grow = this.proto.growProperty.physicalDefense * (this.lv - 1)
        const extra = this.extraProperty.physicalDefense || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.physicalDefense : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.physicalDefense ? sum + bf.extraProperty.physicalDefense : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 魔法防御力
    public get magicDefense(): number {
        const base = this.proto.baseProperty.magicDefense 
        const grow = this.proto.growProperty.magicDefense * (this.lv - 1)
        const extra = this.extraProperty.magicDefense || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.magicDefense : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.magicDefense ? sum + bf.extraProperty.magicDefense : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 光属性抗性
    public get lightResistance(): number {
        const base = this.proto.baseProperty.lightResistance 
        const grow = this.proto.growProperty.lightResistance * (this.lv - 1)
        const extra = this.extraProperty.lightResistance || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.lightResistance : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.lightResistance ? sum + bf.extraProperty.lightResistance : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 暗属性抗性
    public get darkResistance(): number {
        const base = this.proto.baseProperty.darkResistance 
        const grow = this.proto.growProperty.darkResistance * (this.lv - 1)
        const extra = this.extraProperty.darkResistance || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.darkResistance : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.darkResistance ? sum + bf.extraProperty.darkResistance : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 物理穿透
    public get physicalPenetration(): number {
        const base = this.proto.baseProperty.physicalPenetration 
        const grow = this.proto.growProperty.physicalPenetration * (this.lv - 1)
        const extra = this.extraProperty.physicalPenetration || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.physicalPenetration : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.physicalPenetration ? sum + bf.extraProperty.physicalPenetration : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 魔法穿透
    public get magicPenetration(): number {
        const base = this.proto.baseProperty.magicPenetration 
        const grow = this.proto.growProperty.magicPenetration * (this.lv - 1)
        const extra = this.extraProperty.magicPenetration || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.magicPenetration : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.magicPenetration ? sum + bf.extraProperty.magicPenetration : sum, 0)
        return base + grow + extra + equip + buff
    }
    // 暴击率 0 - 1
    public get criticalRate(): number {
        const base = this.proto.baseProperty.criticalRate
        const extra = this.extraProperty.criticalRate || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => {
                return eq ? (sum + eq.criticalRate) : sum
            } , 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.criticalRate ? sum + bf.extraProperty.criticalRate : sum, 0)
        return base + extra + equip + buff
    }
    // 暴击伤害
    public get criticalDamage(): number {
        const base = this.proto.baseProperty.criticalDamage 
        const extra = this.extraProperty.criticalDamage || 0 
        const equip = Object.keys(this.equipments)
            .map(k => this.equipments[k])
            .reduce((sum, eq) => eq ? sum + eq.criticalDamage : sum, 0)
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.criticalDamage ? sum + bf.extraProperty.criticalDamage : sum , 0)
        return base + extra + equip + buff
    }
    // 攻击速度
    public get attackSpeed(): number {
        const buff = this.buffs
            .reduce((sum, bf) => bf.extraProperty.attackSpeed ? sum + bf.extraProperty.attackSpeed : sum, 0)
        if (this.equipments.weapon) {
            return Math.max(0.4 , Math.min(this.equipments.weapon.attackSpeed + buff , 3))
        } else {
            return Math.max(0.4 , Math.min(1 + buff , 3))
        }
    }

}
