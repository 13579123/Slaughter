// 物理减伤计算
export function physicalInjuryReduction(
    physicalPenetration: number,
    physicalDefense: number,
) {
    return (physicalDefense - physicalPenetration) / ((physicalDefense - physicalPenetration) + 200)
}

// 魔法减伤计算
export function magicInjuryReduction(
    magicPenetration: number,
    magicDefense: number,
) {
    return (magicDefense - magicPenetration) / ((magicDefense - magicPenetration) + 210)
}

// 光抗性减伤计算
export function lightInjuryReduction(
    lightResistance: number
) {
    return lightResistance / (lightResistance + 200)
}

// 暗抗性减伤计算
export function darkInjuryReduction(
    darkResistance: number
) {
    return darkResistance / (darkResistance + 200)
}