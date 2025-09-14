import { Brave } from "db://assets/Mod/Base/Player/Brave";
import { AllLanguageType, LanguageType } from "../../Module/Language/LangaugeType";
import { CharacterDTO } from "../../System/Core/Prototype/CharacterPrototype";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { Manager } from "../../System/Manager";
import { getCharacterKey } from "../../System/Manager/CharacterManager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";

class BackpackDTO {

    public items: ItemDTO[] = []

    constructor(data?: BackpackData) {
        if (data) {
            this.items = data.items
        }
    }

}

class BackpackData {

    public items: ItemDTO[] = []

    constructor(data?: BackpackDTO) {
        if (data) {
            this.items = data.items
        }
    }

}

export const backpackManager = new Manager({
    storageKey: "slaughter:game:backpack",
    descrypt: Config.descrypt,
    Constructor: BackpackData,
    DtoCostructor: BackpackDTO,
})

try {
    // @ts-ignore
    window.backpackManager = backpackManager
} catch(e) {
}