import { SpriteFrame } from "cc";
import { CharacterDTO } from "../../../System/Core/Prototype/CharacterPrototype";
import { EquipmentDTO, EquipmentQuality } from "../../../System/Core/Prototype/EquipmentPrototype";
import { FightMapInstance } from "../Instance/FightMapInstance";

export type MonsterDTO = {
    dto: CharacterDTO,
    dropExp: () => number,
    dropGold: () => number,
    dropDiamond: () => number,
    dropItems: { posibility: () => number , count: () => number , item: string}[],
    dropeEquipments: { posibility: () => number , quality: () => EquipmentQuality , equipment: string}[],
}

export type MonsterData = {
    boss: MonsterDTO[],
    monsters: MonsterDTO[],
}

export class FightMapPrototype {

    // 可能出现的装备
    public get equipList(): string[] {
        return []
    }

    // 地图尺寸
    public get size() {
        return { x: 0 , y : 0 }
    }

    // 怪物数据
    public get monsterData(): MonsterData {
        return {
            boss: [],
            monsters: [],
        }
    }

    // 怪物数量区间
    public get monsterCount() {
        return [5 , 10]
    }

    // icon列表
    public get icon(): {
        wall: (() => Promise<SpriteFrame>)[],
        floor: (() => Promise<SpriteFrame>)[],
    } {
        return {
            wall: [],
            floor: [],
        }
    }

    // 构造器
    constructor(public readonly instance: FightMapInstance) {
    }

}
