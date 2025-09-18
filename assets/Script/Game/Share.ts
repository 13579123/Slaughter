import { Rx } from "../../Module/Rx";
import { CharacterInstance } from "../System/Core/Instance/CharacterInstance";
import { CharacterDTO } from "../System/Core/Prototype/CharacterPrototype";
import { getCharacterPrototype } from "../System/Manager/CharacterManager";
import { characterManager } from "./Manager/CharacterManager";
import { equipmentManager } from "./Manager/EquipmentManager";
import { skillManager } from "./Manager/SkillManager";
import { getPlayerAllPassiveSkills, getPlayerSkillRootsNode } from "./System/SkillConfig";

// 根据玩家数据创建角色实例
export function createPlayerInstance() {
    const characterData = characterManager.data
    const skillData = skillManager.data
    const equipmentData = equipmentManager.data
    // 获取角色所有被动技能
    const playerAllPassiveSkills = getPlayerAllPassiveSkills(characterData.currentCharacter)
    // 创建角色
    const instance = Rx.reactive(new CharacterInstance({
        lv: characterData.lv,
        equipments: equipmentData.equipment,
        // 主动技能和被动技能
        skills: skillData.skills.map(
            skillProto => ({ lv: skillData.skillLevel[skillProto] , prototype: skillProto })
        ).concat(playerAllPassiveSkills.map((key) => ({ lv: skillData.skillLevel[key], prototype: key }))),
        Proto: getCharacterPrototype(characterData.currentCharacter),
    }))
    return instance
}

let id = 0
const date = Date.now()
// 创建id
export function createId() {
    return `${date}_${id++}`
}