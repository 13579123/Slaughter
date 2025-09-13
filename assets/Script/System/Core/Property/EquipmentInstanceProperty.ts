import { EquipmentPrototype } from '../Prototype/EquipmentPrototype';
import { BaseInstanceProperty } from './BaseInstanceProperty';

export class EquipmentInstanceProperty extends BaseInstanceProperty {
    // 品质
    public quality: number = 0 // 品质范围 1 - 5
    // 对应的原型
    public proto: EquipmentPrototype = null
    // 额外属性
    public extraProperty: Partial<BaseInstanceProperty> = {}
    // 最大生命值
    public get maxHp(): number {
        const base = this.proto.baseProperty.maxHp * (1 + this.quality / 10)
        const grow = this.proto.growProperty.maxHp * (this.lv - 1)
        const extra = this.extraProperty.maxHp || 0
        return base + grow + extra
    }
    // 最大魔法值
    public get maxMp(): number {
        const base = this.proto.baseProperty.maxMp * (1 + this.quality / 10)
        const grow = this.proto.growProperty.maxMp * (this.lv - 1)
        const extra = this.extraProperty.maxMp || 0
        return base + grow + extra
    }
    // 物理攻击力
    public get physicalAttack(): number {
        const base = this.proto.baseProperty.physicalAttack * (1 + this.quality / 10)
        const grow = this.proto.growProperty.physicalAttack * (this.lv - 1)
        const extra = this.extraProperty.physicalAttack || 0
        return base + grow + extra
    }
    // 魔法攻击力
    public get magicAttack(): number {
        const base = this.proto.baseProperty.magicAttack * (1 + this.quality / 10)
        const grow = this.proto.growProperty.magicAttack * (this.lv - 1)
        const extra = this.extraProperty.magicAttack || 0
        return base + grow + extra
    }
    // 光属性攻击力
    public get lightAttack(): number {
        const base = this.proto.baseProperty.lightAttack * (1 + this.quality / 10)
        const grow = this.proto.growProperty.lightAttack * (this.lv - 1)
        const extra = this.extraProperty.lightAttack || 0
        return base + grow + extra
    }
    // 暗属性攻击力
    public get darkAttack(): number {
        const base = this.proto.baseProperty.darkAttack * (1 + this.quality / 10)
        const grow = this.proto.growProperty.darkAttack * (this.lv - 1)
        const extra = this.extraProperty.darkAttack || 0
        return base + grow + extra
    }
    // 物理防御力
    public get physicalDefense(): number {
        const base = this.proto.baseProperty.physicalDefense * (1 + this.quality / 10)
        const grow = this.proto.growProperty.physicalDefense * (this.lv - 1)
        const extra = this.extraProperty.physicalDefense || 0
        return base + grow + extra
    }
    // 魔法防御力
    public get magicDefense(): number {
        const base = this.proto.baseProperty.magicDefense * (1 + this.quality / 10)
        const grow = this.proto.growProperty.magicDefense * (this.lv - 1)
        const extra = this.extraProperty.magicDefense || 0
        return base + grow + extra
    }
    // 光属性抗性
    public get lightResistance(): number {
        const base = this.proto.baseProperty.lightResistance * (1 + this.quality / 10)
        const grow = this.proto.growProperty.lightResistance * (this.lv - 1)
        const extra = this.extraProperty.lightResistance || 0
        return base + grow + extra
    }
    // 暗属性抗性
    public get darkResistance(): number {
        const base = this.proto.baseProperty.darkResistance * (1 + this.quality / 10)
        const grow = this.proto.growProperty.darkResistance * (this.lv - 1)
        const extra = this.extraProperty.darkResistance || 0
        return base + grow + extra
    }
    // 物理穿透
    public get physicalPenetration(): number {
        const base = this.proto.baseProperty.physicalPenetration * (1 + this.quality / 10)
        const grow = this.proto.growProperty.physicalPenetration * (this.lv - 1)
        const extra = this.extraProperty.physicalPenetration || 0
        return base + grow + extra
    }
    // 魔法穿透
    public get magicPenetration(): number {
        const base = this.proto.baseProperty.magicPenetration * (1 + this.quality / 10)
        const grow = this.proto.growProperty.magicPenetration * (this.lv - 1)
        const extra = this.extraProperty.magicPenetration || 0
        return base + grow + extra
    }
    // 暴击率 0 - 1
    public get criticalRate(): number {
        const base = this.proto.baseProperty.criticalRate
        const grow = Math.floor(this.lv / 3)
        const extra = this.extraProperty.criticalRate || 0
        return base + grow + extra
    }
    // 暴击伤害
    public get criticalDamage(): number {
        const base = this.proto.baseProperty.criticalDamage * (1 + this.quality / 10)
        const grow = this.proto.growProperty.criticalDamage * (this.lv - 1)
        const extra = this.extraProperty.criticalDamage || 0
        return base + grow + extra
    }
    // 攻击速度
    public get attackSpeed(): number {
        const base = this.proto.baseProperty.attackSpeed
        const extra = this.extraProperty.attackSpeed || 0
        return base + extra
    }

}
