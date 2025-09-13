import { AllLanguageType, LanguageType } from "../../Module/Language/LangaugeType";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { Manager } from "../../System/Manager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";

class EquipmentManagerDTO {

    public equipment: {
        weapon?: EquipmentDTO,
        armor?: EquipmentDTO,
        shoes?: EquipmentDTO,
        Accessory?: EquipmentDTO,
    } = {}

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
        weapon?: EquipmentDTO,
        armor?: EquipmentDTO,
        shoes?: EquipmentDTO,
        Accessory?: EquipmentDTO,
    } = {}

    public equipments: EquipmentDTO[] = []

    constructor(data?: EquipmentManagerDTO) {
        if (data) {
            Object.keys(data.equipment).forEach(k => this.equipment[k] = data.equipment[k])
            this.equipments = data.equipments
        }
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
} catch(e) {
}