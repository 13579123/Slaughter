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
    const skills = []
    const passive = playerAllPassiveSkills.map((key) => ({ lv: skillData.skillLevel[key], prototype: key }))
    skillData.skills.forEach(
        skillProto => skills.push({ lv: skillData.skillLevel[skillProto] , prototype: skillProto })
    )
    passive.forEach(skillDto => {
        if (skillDto.lv > 0)
            skills.push(skillDto)
    })
    const instance = new CharacterInstance({
        lv: characterData.lv,
        // 主动技能和被动技能
        skills,
        equipments: equipmentData.equipment,
        Proto: getCharacterPrototype(characterData.currentCharacter),
    })
    return instance
}

let id = 0
const date = Date.now()
// 创建id
export function createId() {
    return `${date}_${id++}`
}