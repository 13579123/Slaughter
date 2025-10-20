import { SpriteFrame } from "cc";
import { CharacterDTO } from "../../../System/Core/Prototype/CharacterPrototype";
import { EquipmentDTO, EquipmentQuality } from "../../../System/Core/Prototype/EquipmentPrototype";
import { FightMapInstance, MapData } from "../Instance/FightMapInstance";
import { ItemDTO } from "../../../System/Core/Prototype/ItemPrototype";
import { CcNative } from "db://assets/Module/CcNative";
import { BasePrototypeProperty } from "../../../System/Core/Property/BasePrototypeProperty";

export type MonsterDTO = {
    dto: CharacterDTO,
    dropExp: () => number,
    dropGold: () => number,
    dropDiamond: () => number,
    dropItems: { posibility: () => number, count: () => number, item: string }[],
    dropeEquipments: { posibility: () => number, quality: () => EquipmentQuality, equipment: string }[],
}

export type MonsterData = {
    monsterCount: () => number,
    boss: () => MonsterDTO,
    monsters: () => MonsterDTO,
}

export type ReinforcementDTO = {
    icon: () => Promise<SpriteFrame>,
    property: () => Partial<BasePrototypeProperty>
}

export class FightMapPrototype {

    public get isBoss() {
        return false
    }

    // 可能出现的装备列表
    public get equipList(): string[] {
        return []
    }

    // 怪物数据
    public get monsterData(): MonsterData {
        return {
            monsterCount: () => 10,
            boss: () => null,
            monsters: () => null,
        }
    }

    public get floorIcon() {
        return {
            floor: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/FightMap/Forest_1_Caodi/spriteFrame", SpriteFrame
                    )).value
                }
            ],
            special: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/FightMap/Forest_1_Caodi/spriteFrame", SpriteFrame
                    )).value
                }
            ]
        }
    }

    public get wallIcon() {
        return {
            // 顶部墙壁
            top: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/FightMap/Stone/spriteFrame" , SpriteFrame
                    )).value
                }
            ],
            // 底部墙壁
            bottom: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/FightMap/Stone/spriteFrame" , SpriteFrame
                    )).value
                }
            ],
            // 左右侧墙壁
            wall: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/FightMap/Stone/spriteFrame" , SpriteFrame
                    )).value
                }
            ],
        }
    }

    public get treasureIcon() {
        return {
            open: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/Treasure/open-treasure-01/spriteFrame" , SpriteFrame
                    )).value
                } ,
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/Treasure/open-treasure-02/spriteFrame" , SpriteFrame
                    )).value
                } ,
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/Treasure/open-treasure-03/spriteFrame" , SpriteFrame
                    )).value
                } ,
            ],
            close: [
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/Treasure/close-treasure-01/spriteFrame", SpriteFrame
                    )).value
                } ,
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/Treasure/close-treasure-02/spriteFrame" , SpriteFrame
                    )).value
                } ,
                async (): Promise<SpriteFrame> => {
                    return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                        "Texture/Treasure/close-treasure-03/spriteFrame" , SpriteFrame
                    )).value
                } ,
            ]
        }
    }

    public get obstacleIcon() {
        return [
            async (): Promise<SpriteFrame> => {
                return (await (new CcNative.Asset.AssetManager("ModBaseResource")).load(
                    "Texture/FightMap/Stone/spriteFrame", SpriteFrame
                )).value
            }
        ]
    }

    // 宝箱奖励
    public getTreasureGoldReward(level: number): {
        gold: number,
        diamond: number,
        items: ItemDTO[],
        equipments: EquipmentDTO[],
    } {
        return {
            gold: 0,
            diamond: 0,
            items: [],
            equipments: [],
        }
    }

    // 房间数据
    public get mapSize() {
        return {
            width: 31,
            height: 31,
        }
    }

    // 强化符文数据
    public get reinforcementData(): {posibility: number , max: number , min: number , data: ReinforcementDTO[]} {
        return {
            posibility: 0.01, // 仅对非boss关卡生效
            max: 4, // 仅对非boss关卡生效
            min: 1, // 仅对非boss关卡生效
            data: []
        }
    }

    // 构造器
    constructor(public readonly instance: FightMapInstance) {
    }

    // 离开回调
    public onLeave() {
    }

}
