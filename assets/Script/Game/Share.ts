import { Rx } from "../Module/Rx";
import { CharacterInstance } from "../System/Core/Instance/CharacterInstance";
import { CharacterDTO } from "../System/Core/Prototype/CharacterPrototype";
import { getCharacterPrototype } from "../System/Manager/CharacterManager";
import { characterManager } from "./Manager/CharacterManager";
import { equipmentManager } from "./Manager/EquipmentManager";

export function createPlayerInstance() {
    return new CharacterInstance({
        lv: characterManager.data.lv,
        buffs: [],
        skills: [],
        equipments: equipmentManager.data.equipment,
        Proto: getCharacterPrototype(characterManager.data.currentCharacter.prototype),
    })
}