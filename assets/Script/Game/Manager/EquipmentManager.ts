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
        if (equipment.lv >= 10)
            return message.toast(
                LanguageManager.getEntry("EquipmentMaxLevel")
                .getValue(settingManager.data.language)
            )
        const strongMaterial = getStrongMaterial(equipment.prototype , equipment.lv)
        if (!strongMaterial) return equipment.lv += 1
        if (resourceManager.data.gold < strongMaterial.gold) 
            return message.toast(
                LanguageManager.getEntry("NotEnoughGold")
                .getValue(settingManager.data.language)
            )
        if (resourceManager.data.diamond < strongMaterial.diamond) 
            return message.toast(
                LanguageManager.getEntry("NotEnoughDiamond")
                .getValue(settingManager.data.language)
            )
        for (let i = 0; i < strongMaterial.items.length; i++) {
            const itemProto = strongMaterial.items[i];
            if (!backpackManager.data.hasItem(itemProto.prototype , itemProto.count || 0)) 
                return message.toast(
                    LanguageManager.getEntry("NotEnoughItems").getValue(settingManager.data.language)
                )
        }
        resourceManager.data.reduceGold(strongMaterial.gold)
        resourceManager.data.reduceDiamond(strongMaterial.diamond)
        strongMaterial.items.forEach(item => {
            backpackManager.data.reduceCount(item.prototype , item.count || 0)
        })
        equipment.lv += 1
        this.emit("strengthenEquipment" , equipment)
    }

    // 分解装备
    public decompose(id: string , resourceManager: Manager<ResourcecData> , backpackManager: Manager<BackpackData>) {
        const equipment = this.equipments.find(e => e.id === id)
        if (!equipment) return
        const material = getDecomposeMaterial(equipment.prototype , equipment.lv)
        resourceManager.data.addGold(material.gold || 0)
        resourceManager.data.addDiamond(material.diamond || 0)
        if (material.items)
            material.items.forEach(item => {
                backpackManager.data.addItem(item.prototype , item.count || 0)
            })
        this.emit("decomposeEquipment" , equipment)
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