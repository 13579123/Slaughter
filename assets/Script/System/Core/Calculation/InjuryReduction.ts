// 物理减伤计算
export function physicalInjuryReduction(
    physicalPenetration: number,
    physicalDefense: number,
) {
    return (physicalDefense - physicalPenetration) /  Math.max(1 , ((physicalDefense - physicalPenetration) + 250))
}

// 魔法减伤计算
export function magicInjuryReduction(
    magicPenetration: number,
    magicDefense: number,
) {
    return (magicDefense - magicPenetration) /  Math.max(1 , ((magicDefense - magicPenetration) + 260))
}

// 光抗性减伤计算
export function lightInjuryReduction(
    lightResistance: number
) {
    return lightResistance /  Math.max(1 , lightResistance + 190)
}

// 暗抗性减伤计算
export function darkInjuryReduction(
    darkResistance: number
) {
    return darkResistance / Math.max(1 , darkResistance + 190)
}