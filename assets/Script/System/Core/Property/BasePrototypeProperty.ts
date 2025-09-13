
export class BasePrototypeProperty {
    // 生命值信息
    protected _maxHp: number = 0;
    public get maxHp(): number {
        return this._maxHp;
    }
    // 魔法值信息
    protected _maxMp: number = 0;
    public get maxMp(): number {
        return this._maxMp;
    }
    // 物理攻击力信息
    protected _physicalAttack: number = 0;
    public get physicalAttack(): number {
        return this._physicalAttack;
    }
    // 魔法攻击力信息
    protected _magicAttack: number = 0;
    public get magicAttack(): number {
        return this._magicAttack;
    }
    // 光属性攻击力信息
    protected _lightAttack: number = 0;
    public get lightAttack(): number {  
        return this._lightAttack;
    }   
    // 暗属性伤害信息
    protected _darkAttack: number = 0;
    public get darkAttack(): number {
        return this._darkAttack;
    }
    // 物理防御力信息
    protected _physicalDefense: number = 0;
    public get physicalDefense(): number {
        return this._physicalDefense;
    }
    // 魔法防御力信息
    protected _magicDefense: number = 0;
    public get magicDefense(): number {
        return this._magicDefense;
    }
    // 光属性抗性信息
    protected _lightResistance: number = 0
    public get lightResistance(): number {
        return this._lightResistance;
    }
    // 暗属性抗性信息
    protected _darkResistance: number = 0;
    public get darkResistance(): number {
        return this._darkResistance;
    }
    // 物理穿透信息
    protected _physicalPenetration: number = 0;
    public get physicalPenetration(): number {
        return this._physicalPenetration;
    }
    // 魔法穿透信息
    protected _magicPenetration: number = 0
    public get magicPenetration(): number {
        return this._magicPenetration;
    }
    // 暴击率信息
    protected _criticalRate: number = 0;
    public get criticalRate(): number {
        return this._criticalRate;
    }
    // 暴击伤害信息
    protected _criticalDamage: number = 0;
    public get criticalDamage(): number {
        return this._criticalDamage;
    }
    // 攻击速度信息
    protected _attackSpeed: number = 0;
    public get attackSpeed(): number {
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

}
