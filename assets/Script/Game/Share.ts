import { Rx } from "../Module/Rx";
import { CharacterInstance } from "../System/Core/Instance/CharacterInstance";
import { CharacterDTO } from "../System/Core/Prototype/CharacterPrototype";
import { getCharacterPrototype } from "../System/Manager/CharacterManager";
import { characterManager } from "./Manager/CharacterManager";
import { equipmentManager } from "./Manager/EquipmentManager";
import { skillManager } from "./Manager/SkillManager";

export function createPlayerInstance() {
    return new CharacterInstance({
        lv: characterManager.data.lv,
        buffs: [],
        skills: skillManager.data.skills.map(skillProto => ({
            lv: skillManager.data.skillLevel[skillProto],
            prototype: skillProto
        })),
        equipments: equipmentManager.data.equipment,
        Proto: getCharacterPrototype(characterManager.data.currentCharacter.prototype),
    })
}

let id = 0
const date = Date.now()
// 创建id
export function createId() {
    return `${date}_${id++}`
}