import { SpriteFrame } from "cc";
import { CcNative } from "db://assets/Module/CcNative";
import { RegisterFightMap } from "db://assets/Script/Game/System/Manager/FightMapManager";
import { FightMapPrototype, MonsterData } from "db://assets/Script/Game/System/Prototype/FightMapPrototype";
import { CharacterDTO } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { getCharacterKey } from "db://assets/Script/System/Manager/CharacterManager";
import { Brave } from "../Player/Brave";

@RegisterFightMap("Forest_1")
export class Forest_1 extends FightMapPrototype {
    
    public get size(): { x: number; y: number; } {
        return { x: 21, y: 21 };
    }

    public get icon(): { wall: (() => Promise<SpriteFrame>)[]; floor: (() => Promise<SpriteFrame>)[]; } {
        return {
            wall: [
                () => {
                    const manager = new CcNative.Asset.AssetManager("ModBaseResource")
                    return new Promise<SpriteFrame>(async (res) => {
                        const asset = await manager.load("Texture/FightMap/Stone/spriteFrame" , SpriteFrame , true)
                        res(asset.value)
                    })
                },
            ],
            floor: [
                () => {
                    const manager = new CcNative.Asset.AssetManager("ModBaseResource")
                    return new Promise<SpriteFrame>(async (res) => {
                        const asset = await manager.load("Texture/FightMap/Forest_1_Caodi/spriteFrame" , SpriteFrame , true)
                        res(asset.value)
                    })
                },
            ]
        }
    }

    public get monsterData(): MonsterData {
        return {
            boss: [
                {
                    dto: {
                        lv: 15,
                        buffs: [],
                        skills: [],
                        equipments: {},
                        extraProperty: {},
                        prototype: getCharacterKey(Brave),
                    } ,
                    dropItems: [],
                    dropeEquipments: [],
                    dropExp: () => Math.floor(Math.random() * 5 + 5),
                    dropGold: () => Math.floor(Math.random() * 30 + 20),
                    dropDiamond: () => Math.floor(Math.random() * 2 + 1),
                }
            ],
            monsters: [
                {
                    dto: {
                        lv: 5,
                        buffs: [],
                        skills: [],
                        equipments: {},
                        extraProperty: {},
                        prototype: getCharacterKey(Brave),
                    } ,
                    dropItems: [],
                    dropeEquipments: [],
                    dropExp: () => Math.floor(Math.random() * 5 + 5),
                    dropGold: () => Math.floor(Math.random() * 30 + 20),
                    dropDiamond: () => Math.floor(Math.random() * 2 + 1),
                }
            ],
        }
    }

    public get monsterCount() {
        return [20 , 28]
    }

}