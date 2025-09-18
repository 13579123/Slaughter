// 物理减伤计算
export function physicalInjuryReduction(
    physicalPenetration: number,
    physicalDefense: number,
) {
    return (physicalDefense - physicalPenetration) / ((physicalDefense - physicalPenetration) + 250)
}

// 魔法减伤计算
export function magicInjuryReduction(
    magicPenetration: number,
    magicDefense: number,
) {
    return (magicDefense - magicPenetration) / ((magicDefense - magicPenetration) + 260)
}

// 光抗性减伤计算
export function lightInjuryReduction(
    lightResistance: number
) {
    return lightResistance / (lightResistance + 190)
}

// 暗抗性减伤计算
export function darkInjuryReduction(
    darkResistance: number
) {
    return darkResistance / (darkResistance + 190)
}