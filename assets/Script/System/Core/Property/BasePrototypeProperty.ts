
export class BasePrototypeProperty {
    // 自定义getter
    protected getterMap: Map<string, Function> = new Map();
    // 生命值信息
    protected _maxHp: number = 0;
    public get maxHp(): number {
        if (this.getterMap.get("maxHp")) {
            return this.getterMap.get("maxHp")(this._maxHp)
        }
        return this._maxHp;
    }
    // 魔法值信息
    protected _maxMp: number = 0;
    public get maxMp(): number {
        if (this.getterMap.get("maxMp")) {
            return this.getterMap.get("maxMp")(this._maxMp)
        }
        return this._maxMp;
    }
    // 物理攻击力信息
    protected _physicalAttack: number = 0;
    public get physicalAttack(): number {
        if (this.getterMap.get("physicalAttack")) {
            return this.getterMap.get("physicalAttack")(this._physicalAttack)
        }
        return this._physicalAttack;
    }
    // 魔法攻击力信息
    protected _magicAttack: number = 0;
    public get magicAttack(): number {
        if (this.getterMap.get("magicAttack")) {
            return this.getterMap.get("magicAttack")(this._magicAttack)
        }
        return this._magicAttack;
    }
    // 光属性攻击力信息
    protected _lightAttack: number = 0;
    public get lightAttack(): number {
        if (this.getterMap.get("lightAttack")) {
            return this.getterMap.get("lightAttack")(this._lightAttack)
        }
        return this._lightAttack;
    }
    // 暗属性伤害信息
    protected _darkAttack: number = 0;
    public get darkAttack(): number {
        if (this.getterMap.get("darkAttack")) {
            return this.getterMap.get("darkAttack")(this._darkAttack)
        }
        return this._darkAttack;
    }
    // 物理防御力信息
    protected _physicalDefense: number = 0;
    public get physicalDefense(): number {
        if (this.getterMap.get("physicalDefense")) {
            return this.getterMap.get("physicalDefense")(this._physicalDefense)
        }
        return this._physicalDefense;
    }
    // 魔法防御力信息
    protected _magicDefense: number = 0;
    public get magicDefense(): number {
        if (this.getterMap.get("magicDefense")) {
            return this.getterMap.get("magicDefense")(this._magicDefense)
        }
        return this._magicDefense;
    }
    // 光属性抗性信息
    protected _lightResistance: number = 0
    public get lightResistance(): number {
        if (this.getterMap.get("lightResistance")) {
            return this.getterMap.get("lightResistance")(this._lightResistance)
        }
        return this._lightResistance;
    }
    // 暗属性抗性信息
    protected _darkResistance: number = 0;
    public get darkResistance(): number {
        if (this.getterMap.get("darkResistance")) {
            return this.getterMap.get("darkResistance")(this._darkResistance)
        }
        return this._darkResistance;
    }
    // 物理穿透信息
    protected _physicalPenetration: number = 0;
    public get physicalPenetration(): number {
        if (this.getterMap.get("physicalPenetration")) {
            return this.getterMap.get("physicalPenetration")(this._physicalPenetration)
        }
        return this._physicalPenetration;
    }
    // 魔法穿透信息
    protected _magicPenetration: number = 0
    public get magicPenetration(): number {
        if (this.getterMap.get("magicPenetration")) {
            return this.getterMap.get("magicPenetration")(this._magicPenetration)
        }
        return this._magicPenetration;
    }
    // 暴击率信息
    protected _criticalRate: number = 0;
    public get criticalRate(): number {
        if (this.getterMap.get("criticalRate")) {
            return this.getterMap.get("criticalRate")(this._criticalRate)
        }
        return this._criticalRate;
    }
    // 暴击伤害信息
    protected _criticalDamage: number = 0;
    public get criticalDamage(): number {
        if (this.getterMap.get("criticalDamage")) {
            return this.getterMap.get("criticalDamage")(this._criticalDamage)
        }
        return this._criticalDamage;
    }
    // 攻击速度信息
    protected _attackSpeed: number = 0;
    public get attackSpeed(): number {
        if (this.getterMap.get("attackSpeed")) {
            return this.getterMap.get("attackSpeed")(this._attackSpeed)
        }
        return this._attackSpeed;
    }
    // 构造器
    constructor(propertyData?: Partial<BasePrototypeProperty>) {
        if (propertyData) {
            Object.keys(propertyData).forEach(key => {
                if (this.hasOwnProperty(`_${key}`)) {
                    (this as any)[`_${key}`] = (propertyData as any)[key];
                }
            })
        }
    }

    // 设置属性信息
    public setProperty(
        key: keyof BasePrototypeProperty, 
        value: number|((ordinary: number) => number)
    ): BasePrototypeProperty {
        if (typeof value === "number") {
            if (this.hasOwnProperty(`_${key}`)) {
                (this as any)[`_${key}`] = value;
            }
        } else {
            this.getterMap.set(key , value)
        }
        return this
    }

}
