import { AllLanguageType, LanguageType } from "../../Module/Language/LangaugeType";
import { EquipmentDTO, EquipmentQuality } from "../../System/Core/Prototype/EquipmentPrototype";
import { Manager } from "../../System/Manager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";

function deepCompare(x: {[k: string]: any}, y: {[k: string]: any}) {
    if (x === y) return true;
    if (typeof x !== 'object' || typeof y !== 'object') return false;

    const keysX = Object.keys(x);
    const keysY = Object.keys(y);

    if (keysX.length !== keysY.length) return false;

    for (let key of keysX) {
        if (!deepCompare(x[key], y[key])) return false;
    }

    return true;
}

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
        weapon: EquipmentDTO,
        armor: EquipmentDTO,
        shoes: EquipmentDTO,
        Accessory: EquipmentDTO,
    } = {
            weapon: { lv: 1, prototype: "Spear", extraProperty: {}, quality: EquipmentQuality.Legendary },
            armor: null,
            shoes: null,
            Accessory: null,
        }

    public equipments: EquipmentDTO[] = []

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