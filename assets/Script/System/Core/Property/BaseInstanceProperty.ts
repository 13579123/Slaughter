
export class BaseInstanceProperty {
    // 等级
    public lv: number = 1
    // 最大生命值
    public get maxHp(): number {
        return 0;
    }
    // 最大魔法值
    public get maxMp(): number {
        return 0;
    }
    // 物理攻击力
    public get physicalAttack(): number {
        return 0;
    }
    // 魔法攻击力
    public get magicAttack(): number {
        return 0;
    }
    // 光属性攻击力
    public get lightAttack(): number {
        return 0;
    }
    // 暗属性攻击力
    public get darkAttack(): number {
        return 0;
    }
    // 物理防御力
    public get physicalDefense(): number {
        return 0;
    }
    // 魔法防御力
    public get magicDefense(): number {
        return 0;
    }
    // 光属性抗性
    public get lightResistance(): number {
        return 0;
    }
    // 暗属性抗性
    public get darkResistance(): number {
        return 0;
    }
    // 物理穿透
    public get physicalPenetration(): number {
        return 0;
    }
    // 魔法穿透
    public get magicPenetration(): number {
        return 0;
    }
    // 暴击率 0 - 1
    public get criticalRate(): number {
        return 0;
    }
    // 暴击伤害
    public get criticalDamage(): number {
        return 0;
    }
    // 攻击速度
    public get attackSpeed(): number {
        return 0;
    }
    // 冷却指数
    public get coolDown(): number {
        return 0
    }
}


