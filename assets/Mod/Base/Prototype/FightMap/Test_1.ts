import { director, SpriteFrame } from "cc";
import { CcNative } from "db://assets/Module/CcNative";
import { RegisterFightMap } from "db://assets/Script/Game/System/Manager/FightMapManager";
import { FightMapPrototype, MonsterData, ReinforcementDTO } from "db://assets/Script/Game/System/Prototype/FightMapPrototype";
import { CharacterDTO } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { getCharacterKey } from "db://assets/Script/System/Manager/CharacterManager";
import { Brave } from "../Player/Brave";
import { getItemKey } from "db://assets/Script/System/Manager/ItemManager";
import { Stone } from "../Item/Stone";
import { Spear } from "../Equipment/BeginnerKit/Spear";
import { getEquipmentKey } from "db://assets/Script/System/Manager/EquipmentManager";
import { EquipmentDTO, EquipmentQuality } from "db://assets/Script/System/Core/Prototype/EquipmentPrototype";
import { ItemDTO } from "db://assets/Script/System/Core/Prototype/ItemPrototype";
import { createId } from "db://assets/Script/Game/Share";
import { LeatherArmor } from "../Equipment/BeginnerKit/LeatherArmor";
import { LeatherShoes } from "../Equipment/BeginnerKit/LeatherShoes";
import { LeatherShoulder } from "../Equipment/BeginnerKit/LeatherShoulder";
import { MaxHpReinforcement } from "./Reinforcement/MaxHpReinforcement";
import { PhysicalAttackReinforcement } from "./Reinforcement/PhysicalAttackReinforcement";

@RegisterFightMap("Test_1")
export class Test_1 extends FightMapPrototype {

    public get isBoss(): boolean {
        return false
    }

    public get monsterData(): MonsterData {
        return {
            monsterCount: () => Math.floor(Math.random() * 5 + 5),
            boss: () => {
                return {
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
                    dropExp: () => Math.floor(Math.random() * 30 + 25),
                    dropGold: () => Math.floor(Math.random() * 50 + 50),
                    dropDiamond: () => Math.floor(Math.random() * 5 + 6),
                }
            },
            monsters: () => {
                const level = Math.floor(Math.random() * 5 + 5)
                return {
                    dto: {
                        lv: level,
                        buffs: [],
                        skills: [],
                        equipments: {},
                        extraProperty: {},
                        prototype: getCharacterKey(Brave),
                    } ,
                    dropItems: [
                        { posibility: () => 0.1 , count: () => Math.floor(Math.random() * 3 + 1) , item: getItemKey(Stone) }
                    ],
                    dropeEquipments: [
                        { 
                            quality: () => {
                                const random = Math.random()
                                if (random <= 0.6) return EquipmentQuality.Ordinary
                                if (random <= 0.75) return EquipmentQuality.Fine
                                if (random <= 0.85) return EquipmentQuality.Rare
                                if (random <= 0.93) return EquipmentQuality.Epic
                                if (random <= 0.97) return EquipmentQuality.Legendary
                                if (random <= 1.00) return EquipmentQuality.Mythic
                            } , 
                            posibility: () => 0.1 , 
                            equipment: getEquipmentKey(Spear) 
                        }
                    ],
                    dropExp: () => Math.floor(Math.random() * 5 + 5),
                    dropGold: () => 0,
                    dropDiamond: () => 0,
                }
            }
        }
    }

    public getTreasureGoldReward(level: number): { gold: number; diamond: number; items: ItemDTO[]; equipments: EquipmentDTO[]; } {
        const items: ItemDTO[] = [] , equipments: EquipmentDTO[] = []
        const EquipmentList = [Spear , LeatherArmor , LeatherShoes , LeatherShoulder]
        if (level === 3) {
            const QualityList = [
                EquipmentQuality.Ordinary , EquipmentQuality.Ordinary , EquipmentQuality.Ordinary ,
                EquipmentQuality.Ordinary , EquipmentQuality.Ordinary ,
                EquipmentQuality.Fine , EquipmentQuality.Fine , EquipmentQuality.Fine ,
                EquipmentQuality.Fine , EquipmentQuality.Fine ,
                EquipmentQuality.Rare , EquipmentQuality.Rare , EquipmentQuality.Rare ,
                EquipmentQuality.Epic , EquipmentQuality.Epic ,
                EquipmentQuality.Legendary , EquipmentQuality.Mythic , 
                EquipmentQuality.Ordinary
            ]
            let EquipmentPrototype = EquipmentList[Math.floor(Math.random() * EquipmentList.length)] , 
            quality = QualityList[Math.floor(Math.random() * QualityList.length)]
            equipments.push({
                id: createId(),
                lv: 1,
                quality: quality,
                prototype: getEquipmentKey(EquipmentPrototype),
                extraProperty: {},
            })
        }
        if (level === 2) {
            const QualityList = [
                EquipmentQuality.Ordinary , EquipmentQuality.Ordinary , EquipmentQuality.Ordinary ,
                EquipmentQuality.Ordinary , EquipmentQuality.Ordinary , EquipmentQuality.Ordinary ,
                EquipmentQuality.Fine , EquipmentQuality.Fine , EquipmentQuality.Fine ,
                EquipmentQuality.Fine , EquipmentQuality.Fine ,
                EquipmentQuality.Rare , EquipmentQuality.Rare , EquipmentQuality.Rare ,
                EquipmentQuality.Epic , EquipmentQuality.Epic ,
                EquipmentQuality.Legendary , EquipmentQuality.Mythic , 
            ]
            let EquipmentPrototype = EquipmentList[Math.floor(Math.random() * EquipmentList.length)] , 
            quality = QualityList[Math.floor(Math.random() * QualityList.length)]
            equipments.push({
                id: createId(),
                lv: 1,
                quality: quality,
                prototype: getEquipmentKey(EquipmentPrototype),
                extraProperty: {},
            })
        }
        if (level === 1) {
            const QualityList = [
                EquipmentQuality.Ordinary , EquipmentQuality.Ordinary , EquipmentQuality.Ordinary ,
                EquipmentQuality.Ordinary , EquipmentQuality.Ordinary , EquipmentQuality.Ordinary ,
                EquipmentQuality.Ordinary , , EquipmentQuality.Ordinary ,
                EquipmentQuality.Fine , EquipmentQuality.Fine , EquipmentQuality.Fine ,
                EquipmentQuality.Fine , EquipmentQuality.Fine , EquipmentQuality.Fine  ,
                EquipmentQuality.Rare , EquipmentQuality.Rare , EquipmentQuality.Rare ,
                EquipmentQuality.Epic , EquipmentQuality.Epic ,
                EquipmentQuality.Legendary , EquipmentQuality.Mythic , 
            ]
            let EquipmentPrototype = EquipmentList[Math.floor(Math.random() * EquipmentList.length)] , 
            quality = QualityList[Math.floor(Math.random() * QualityList.length)]
            equipments.push({
                id: createId(),
                lv: 1,
                quality: quality,
                prototype: getEquipmentKey(EquipmentPrototype),
                extraProperty: {},
            })
        }
        return {
            gold: 0,
            diamond: 0,
            items,
            equipments,
        }
    }

    public get reinforcementData(): { posibility: number; max: number; min: number; data: ReinforcementDTO[]; } {
        return {
            posibility: 0.55,
            max: 100,
            min: 50,
            data: [
                MaxHpReinforcement,
                PhysicalAttackReinforcement,
            ],
        }
    }

    public onLeave(): void {
        director.loadScene("Main")
    }

}