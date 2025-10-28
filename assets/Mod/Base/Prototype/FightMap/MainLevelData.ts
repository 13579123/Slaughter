import { FightMapPrototype, MonsterData, ReinforcementDTO, RewardEquipmentDTO, RewardItemsDTO, TreasureData } from "db://assets/Script/Game/System/Prototype/FightMapPrototype";
import { EquipmentDTO, EquipmentQuality } from "db://assets/Script/System/Core/Prototype/EquipmentPrototype";
import { ItemDTO } from "db://assets/Script/System/Core/Prototype/ItemPrototype";
import { LeatherArmor } from "../Equipment/BeginnerKit/LeatherArmor";
import { LeatherShoes } from "../Equipment/BeginnerKit/LeatherShoes";
import { LeatherShoulder } from "../Equipment/BeginnerKit/LeatherShoulder";
import { Spear } from "../Equipment/BeginnerKit/Spear";
import { getEquipmentKey } from "db://assets/Script/System/Manager/EquipmentManager";
import { createId } from "db://assets/Script/Game/Share";
import { getItemKey, getMedicineItemKey } from "db://assets/Script/System/Manager/ItemManager";
import { getCharacterKey } from "db://assets/Script/System/Manager/CharacterManager";
import { Brave } from "../Player/Brave";
import { Goblin } from "../Monster/Goblin";
import { MagicDefenseReinforcement } from "./Reinforcement/MagicDefenseReinforcement";
import { MaxHpReinforcement } from "./Reinforcement/MaxHpReinforcement";
import { MaxMpReinforcement } from "./Reinforcement/MaxMpReinforcement";
import { PhysicalAttackReinforcement } from "./Reinforcement/PhysicalAttackReinforcement";
import { PhysicalDefenseReinforcement } from "./Reinforcement/PhysicalDefenseReinforcement";
import { director } from "cc";
import { enterFightMap, exitFightMap, RegisterFightMap } from "db://assets/Script/Game/System/Manager/FightMapManager";
import { DefectorSoldier } from "../Monster/DefectorSoldier";
import { SkeletonSoldier } from "../Monster/SkeletonSoldier";
import { Crocodile } from "../Monster/Crocodile";
import { FightMapInstance } from "db://assets/Script/Game/System/Instance/FightMapInstance";
import { Stone } from "../Item/Stone";
import { SealingBelt } from "../Equipment/Sealing/SealingBelt";
import { SealingRobe } from "../Equipment/Sealing/SealingRobe";
import { SealingWeapon } from "../Equipment/Sealing/SealingWeapon";
import { SealingShose } from "../Equipment/Sealing/SealingShose";
import { levelDataManager } from "db://assets/Script/Game/Manager/LevelDataManager";
import { HpMedicine } from "../Item/HpMedicine";
import { MpMedicine } from "../Item/MpMedicine";
import { count } from "console";
import { FoxDemon } from "../Monster/FoxDemon";

// 根据宝箱等级获取装备质量 最大为4
function getQualityByTreasureLevel(level: number): EquipmentQuality {
    const qualityList: EquipmentQuality[] = []
    const possibilityData = [
        [40, 25, 15, 10, 5, 5],
        [35, 25, 20, 13, 7, 7],
        [20, 18, 25, 20, 13, 10],
        [10, 12, 18, 20, 20, 15],
    ]
    const allQuality = [
        EquipmentQuality.Ordinary, EquipmentQuality.Rare, EquipmentQuality.Fine,
        EquipmentQuality.Epic, EquipmentQuality.Legendary, EquipmentQuality.Mythic,
    ]
    possibilityData[level - 1].forEach((count, j) => {
        for (let c = 0; c < count; c++) qualityList.push(allQuality[j])
    })
    return qualityList[Math.floor(Math.random() * qualityList.length)]
}

// 根据层数获取宝箱里面的物品列表
function getTreasureReward(floor: number , level: number) {
    if (floor <= 20) {
        return {
            equipments: [
                Spear, LeatherArmor, LeatherShoes, LeatherShoulder,
                SealingWeapon, SealingRobe, SealingShose, SealingBelt,
            ],
            items: [Stone , HpMedicine , MpMedicine],
        }
    }
    return { equipments: [], items: [] }
}

// 获取怪物列表
function getMonsterData(floor: number , instance: FightMapInstance): MonsterData {
    const monsterCount = () => {
        return instance.roomData.length * Math.floor(Math.random() * 4 + 1.5) + Math.floor(Math.random() * 5 + 5)
    }
    const isBoss = () => { return floor % 20 === 0 }
    const floorData = [
        // 0 - 20 层
        {
            boss: [Brave],
            dropItems: [
                {posibility: () => 0.08 , count: () => 1 , item: getMedicineItemKey(HpMedicine)},
                {posibility: () => 0.08 , count: () => 1 , item: getMedicineItemKey(MpMedicine)},
            ],
            dropEquipments: [
                Spear , LeatherArmor , LeatherShoes , LeatherShoulder ,
                SealingWeapon , SealingRobe , SealingShose , SealingBelt ,
            ].map(Prototype => ({
                posibility: () => 0.03 , 
                equipment: getEquipmentKey(Prototype),
                quality: () => getQualityByTreasureLevel(2), 
            })),
            monsters: [Goblin, DefectorSoldier, SkeletonSoldier, Crocodile, FoxDemon],
        } ,
        // 20 - 40 层
    ]
    const dropItems = floorData[Math.floor(floor / 21)].dropItems
    const dropEquipments = floorData[Math.floor(floor / 21)].dropEquipments
    const monsters = floorData[Math.floor(floor / 21)].monsters
    const boss = floorData[Math.floor(floor / 21)].boss
    const dropExp = () => Math.floor((Math.random() * 15 + 5) * (1 + floor * 0.2) * (isBoss() ? 2.5 : 1))
    const dropGold = () => Math.floor((Math.random() * 10 + 5) * (1 + floor * 0.2) * (isBoss() ? 2.5 : 1))
    const dropDiamond = () => {
        if (isBoss()) {
            if (Math.random() < 0.75) 
                return Math.floor((Math.random() * 2 + 1) * (1 + floor * 0.2) * (isBoss() ? 2.5 : 1))
        } else {
            if (Math.random() < 0.05) 
                return Math.floor((Math.random() * 2 + 1) * (1 + floor * 0.2) * (isBoss() ? 2.5 : 1))
        }
        return 0
    }
    return {
        monsterCount ,
        boss: () => {
            return {
                dropItems, dropEquipments,
                dropExp, dropGold, dropDiamond,
                dto: {
                    lv: 20 * (Math.floor(floor / 21) + 1) + 5, buffs: [], skills: [], equipments: {}, extraProperty: {},
                    prototype: getCharacterKey(boss[Math.floor(Math.random() * boss.length)]),
                },
            }
        },
        monsters: () => {
            return {
                dropItems, dropEquipments,
                dropExp, dropGold, dropDiamond,
                dto: {
                    lv: floor, buffs: [], skills: [], equipments: {}, extraProperty: {},
                    prototype: getCharacterKey(monsters[Math.floor(Math.random() * monsters.length)]),
                },
            }
        },
    }
}

@RegisterFightMap("MainLevelData")
export class MainLevelData extends FightMapPrototype {

    public get name(): string {
        return "Level " + (this.instance.customData.floor || 1)
    }

    public get isBoss(): boolean {
        if ((this.instance.customData.floor || 1) % 20 === 0) return true
        return false
    }

    public get monsterData(): MonsterData {
        return getMonsterData(this.instance.customData.floor || 1 , this.instance)
    }

    public get mapSize(): { width: number; height: number; } {
        const size = Math.random() * 20 + 15
        if (size % 2 === 0) return { width: size + 1, height: size + 1 }
        return { width: size, height: size }
    }

    public get reinforcementData(): { posibility: number; max: number; min: number; data: ReinforcementDTO[]; } {
        return {
            posibility: 0.05, max: 5, min: 1,
            data: [
                PhysicalDefenseReinforcement,
                MaxHpReinforcement, MaxMpReinforcement,
                MagicDefenseReinforcement, PhysicalAttackReinforcement,
            ],
        }
    }

    public getTreasureGoldReward(level: number): TreasureData {
        const items: RewardItemsDTO[] = [], equipments: RewardEquipmentDTO[] = []
        const reward = getTreasureReward(this.instance.customData.floor || 1 , level)
        // 随机装备 90%概率 或者 没有物品时
        if (Math.random() < 0.75 || items.length === 0) {
            let count = level < 4 ? 1 : 2
            for (let i = 0; i < count; i++) {
                const EquipmentPrototype = reward.equipments[Math.floor(Math.random() * reward.equipments.length)]
                if (!EquipmentPrototype) continue
                equipments.push({ quality: getQualityByTreasureLevel(level), prototype: getEquipmentKey(EquipmentPrototype) })
            }
        }
        // 随机物品
        else {
            let count = level < 4 ? 1 : 2
            for (let i = 0; i < count; i++) {
                const ItemPrototype = reward.items[Math.floor(Math.random() * reward.items.length)]
                if (!ItemPrototype) continue
                items.push({ prototype: getItemKey(ItemPrototype), count: Math.floor(Math.random() * 5) + 1 })
            }
        }
        return { gold: 0, diamond: Math.max(0 , Math.floor(Math.random() * 10 - 7 + level)), items, equipments }
    }

    public onLeave(): void {
        if (this.instance.customData.floor === 100) {
            exitFightMap()
            return
        } else {
            enterFightMap("MainLevelData", {
                playerState: { hp: this.instance.player.hp, mp: this.instance.player.mp },
                playerExtraProperty: this.instance.player.extraProperty,
                customData: { floor: (this.instance.customData.floor || 1) + 1 }
            })
            levelDataManager.data.mainLevelFloor = (this.instance.customData.floor || 1) + 1
            levelDataManager.save()
        }
    }

}


