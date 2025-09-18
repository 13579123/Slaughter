import { darkInjuryReduction, lightInjuryReduction, magicInjuryReduction, physicalInjuryReduction } from "./InjuryReduction";

export function physicalDamage(
    damage: number,
    penetration: number,
    defense: number,
) {
    const reduction = physicalInjuryReduction(penetration , defense)
    return Math.max(1 , damage * (1 - reduction) - (Math.max(0 , defense - penetration) * 0.1))
}

export function magicDamage(
    damage: number,
    penetration: number,
    defense: number,
) {
    const reduction = magicInjuryReduction(penetration , defense)
    return Math.max(0 , damage * (1 - reduction) - (Math.max(0 , defense - penetration) * 0.07))
}

export function lightDamage(
    damage: number,
    resistance: number,
    darkResistance: number,
) {
    const reduction = lightInjuryReduction(resistance)
    // 暗防御越高，光伤害越高
    const reDamageRate = (1 + darkResistance / (darkResistance + 350))
    return Math.max(0 , (damage * (1 - reduction) - resistance * 0.02) * reDamageRate)
}

export function darkDamage(
    damage: number,
    resistance: number,
    lightResistance: number,
) {
    const reduction = darkInjuryReduction(resistance)
    // 光防御越高，暗伤害越高
    const reDamageRate = (1 + lightResistance / (lightResistance + 350))
    return Math.max(0 , damage * (1 - reduction) - resistance * 0.02 * reDamageRate)
}