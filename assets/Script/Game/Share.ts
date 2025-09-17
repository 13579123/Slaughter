import { CharacterInstance } from "../System/Core/Instance/CharacterInstance";
import { CharacterDTO } from "../System/Core/Prototype/CharacterPrototype";
import { getCharacterPrototype } from "../System/Manager/CharacterManager";
import { characterManager } from "./Manager/CharacterManager";
import { equipmentManager } from "./Manager/EquipmentManager";
import { skillManager } from "./Manager/SkillManager";

export function createPlayerInstance() {
    const characterData = characterManager.data
    const skillData = skillManager.data
    const equipmentData = equipmentManager.data
    return new CharacterInstance({
        lv: characterData.lv,
        equipments: equipmentData.equipment,
        skills: skillData.skills.map(skillProto => ({ lv: skillData.skillLevel[skillProto] , prototype: skillProto })),
        Proto: getCharacterPrototype(characterData.currentCharacter),
    })
}

let id = 0
const date = Date.now()
// 创建id
export function createId() {
    return `${date}_${id++}`
}