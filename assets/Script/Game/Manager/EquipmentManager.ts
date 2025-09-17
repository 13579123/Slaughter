import { EquipmentDTO, EquipmentQuality } from "../../System/Core/Prototype/EquipmentPrototype";
import { Manager } from "../../System/Manager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";
import { createId } from "../Share";
import { EquipmentInstance } from "../../System/Core/Instance/EquipmentInstance";

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

class EquipmentData {

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
        this.equipments.push({ 
            id: createId(),
            prototype,
            lv: 1,
            extraProperty: {},
            quality: quality || EquipmentQuality.Ordinary,
        })
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