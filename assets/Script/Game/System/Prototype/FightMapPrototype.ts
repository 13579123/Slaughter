import { CharacterDTO } from "../../../System/Core/Prototype/CharacterPrototype";
import { EquipmentDTO } from "../../../System/Core/Prototype/EquipmentPrototype";
import { FightMapInstance } from "../Instance/FightMapInstance";

export class FightMapPrototype {

    // 可能出现的怪物及数据
    public get monstList(): CharacterDTO[] {
        return []
    }

    // 可能出现的装备
    public get equipList(): string[] {
        return []
    }

    // 地图尺寸
    public get size() {
        return {
            x: 0 , y : 0
        }
    }

    // 构造器
    constructor(public readonly instance: FightMapInstance) {
    }

}
