import { EquipmentDTO, EquipmentQuality } from "../../System/Core/Prototype/EquipmentPrototype";
import { BaseEventManagerData, Manager } from "../../System/Manager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";
import { createId } from "../Share";
import { EquipmentInstance } from "../../System/Core/Instance/EquipmentInstance";
import { getDecomposeMaterial, getStrongMaterial } from "../../System/Manager/EquipmentManager";
import { message } from "../Message/Message";
import { LanguageManager } from "db://assets/Module/Language/LanguageManager";
import { settingManager } from "./SettingManager";
import { ResourcecData, resourceManager } from "./ResourceManager";
import { BackpackData, backpackManager } from "./BackpackManager";

type EventType = "addEquipment"|"decomposeEquipment"|"strengthenEquipment"

class EquipmentManagerDTO {

    public equipment: {
        weapon: EquipmentDTO,
        armor: EquipmentDTO,
        shoes: EquipmentDTO,
        accessory: EquipmentDTO,
    } = {
            weapon: null,
            armor: null,
            shoes: null,
            accessory: null,
        }

    public equipments: EquipmentDTO[] = []

    constructor(data?: EquipmentData) {
        if (data) {
            Object.keys(data.equipment).forEach(k => this.equipment[k] = data.equipment[k])
            this.equipments = data.equipments
        }
    }

}

export class EquipmentData extends BaseEventManagerData<EventType> {

    public equipment: {
        weapon: EquipmentDTO,
        armor: EquipmentDTO,
        shoes: EquipmentDTO,
        accessory: EquipmentDTO,
    } = {
            weapon: { id: createId() , lv: 1, prototype: "Spear", extraProperty: {}, quality: EquipmentQuality.Ordinary },
            armor: { id: createId() , lv: 1, prototype: "LeatherArmor", extraProperty: {}, quality: EquipmentQuality.Fine },
            shoes: { id: createId() , lv: 1, prototype: "LeatherShoes", extraProperty: {}, quality: EquipmentQuality.Rare },
            accessory: { id: createId() , lv: 1, prototype: "LeatherShoulder", extraProperty: {}, quality: EquipmentQuality.Epic },
        }

    public equipments: EquipmentDTO[] = [
        { id: createId() , lv: 1, prototype: "Spear", extraProperty: {}, quality: EquipmentQuality.Mythic }
    ]

    constructor(data?: EquipmentManagerDTO) {
        super()
        if (data) {
            Object.keys(data.equipment).forEach(k => this.equipment[k] = data.equipment[k])
            this.equipments = data.equipments
        }
    }

    // 卸下装备
    public unequip(type: EquipmentType) {
        const equip = this.equipment[type]
        this.equipment[type] = null
        if (equip)
            this.equipments.push(equip)
    }

    // 穿上装备
    public equip(instance: EquipmentInstance) {
        let equipmentDTO = null , index = -1
        for (let i = 0; i < this.equipments.length; i++) {
            if (instance.id !== this.equipments[i].id) continue
            equipmentDTO = this.equipments[i];
            index = i
            break
        }
        this.equipments.splice(index, 1)
        this.unequip(instance.proto.type)
        this.equipment[instance.proto.type] = equipmentDTO
    }

    // 添加装备
    public addEquipment(prototype: string , quality?: EquipmentQuality) {
        const id = createId()
        this.emit("addEquipment" , {id , prototype , quality: quality || EquipmentQuality.Ordinary})
        this.equipments.push({ 
            id ,
            prototype,
            lv: 1,
            extraProperty: {},
            quality: quality || EquipmentQuality.Ordinary,
        })
    }

    // 强化装备
    public strengthenEquipment(id: string , resourceManager: Manager<ResourcecData> , backpackManager: Manager<BackpackData>) {
        let equipment = this.equipments.find(e => e.id === id)
        if (!equipment) equipment = Object.values(this.equipment).find(e => e?.id === id)
        if (!equipment) return
        if (equipment.lv >= 10){
            message.toast(
                LanguageManager.getEntry("EquipmentMaxLevel")
                .getValue(settingManager.data.language)
            )
            return false
        }
        const strongMaterial = getStrongMaterial(equipment.prototype , equipment.lv)
        if (!strongMaterial) return equipment.lv += 1
        if (resourceManager.data.gold < strongMaterial.gold) {
            message.toast(
                LanguageManager.getEntry("NotEnoughGold")
                .getValue(settingManager.data.language)
            )
            return false
        }
        if (resourceManager.data.diamond < strongMaterial.diamond) {
            message.toast(
                LanguageManager.getEntry("NotEnoughDiamond")
                .getValue(settingManager.data.language)
            )
            return false
        }
        for (let i = 0; i < strongMaterial.items.length; i++) {
            const itemProto = strongMaterial.items[i];
            if (!backpackManager.data.hasItem(itemProto.prototype , itemProto.count || 0)) {
                message.toast(
                    LanguageManager.getEntry("NotEnoughItems").getValue(settingManager.data.language)
                )
                return false 
            }
        }
        resourceManager.data.reduceGold(strongMaterial.gold)
        resourceManager.data.reduceDiamond(strongMaterial.diamond)
        strongMaterial.items.forEach(item => {
            backpackManager.data.reduceCount(item.prototype , item.count || 0)
        })
        equipment.lv += 1
        this.emit("strengthenEquipment" , equipment)
        return true
    }

    // 分解装备
    public decompose(idList: string[] , resourceManager: Manager<ResourcecData> , backpackManager: Manager<BackpackData>) {
        const materials = {gold: 0 , diamond: 0 , items: []}
        idList.forEach(id => {
            const equipment = this.equipments.find(e => e.id === id)
            if (!equipment) return
            const material = getDecomposeMaterial(equipment.prototype , equipment.lv)
            resourceManager.data.addGold(material.gold || 0)
            resourceManager.data.addDiamond(material.diamond || 0)
            if (material.gold) materials.gold = (materials.gold || 0) + material.gold
            if (material.diamond) materials.diamond = (materials.diamond || 0) + material.diamond
            if (material.items) {
                material.items.forEach(item => {
                    let hasItem = false
                    materials.items.forEach(i => {
                        if (i.prototype === item.prototype) {
                            i.count += item.count
                            hasItem = true
                        }
                    })
                    if (!hasItem) materials.items.push(item)
                    backpackManager.data.addItem(item.prototype , item.count || 0)
                })
                this.emit("decomposeEquipment" , equipment)
            }
        })
        this.equipments = Array.from(this.equipments).map(e => {
            if (idList.includes(e.id)) return null
            return e
        }).filter(e => e !== null)
        message.congratulations(
            materials.gold , 
            materials.diamond , 
            materials.items , 
            []
        )
        return
    }

}

export const equipmentManager = new Manager({
    storageKey: "slaughter:game:equipment",
    descrypt: Config.descrypt,
    Constructor: EquipmentData,
    DtoCostructor: EquipmentManagerDTO,
})

try {
    // @ts-ignore
    window.equipmentManager = equipmentManager
} catch (e) {
}