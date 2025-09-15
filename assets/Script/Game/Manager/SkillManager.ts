import { AllLanguageType, LanguageType } from "../../Module/Language/LangaugeType";
import { Rx } from "../../Module/Rx";
import { SkillDTO } from "../../System/Core/Prototype/SkillPrototype";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";
import { characterManager } from "./CharacterManager";

class SkillManagerDTO {

    // 已经装备的技能
    public skills: SkillDTO[] = [];

    // 所有技能等级
    public skillLevel: {[key: string]: number} = {};

    constructor(data?: SkillData) {
        if (data) {
            this.skills = data.skills;
            this.skillLevel = data.skillLevel;
        }
    }

}

class SkillData {

    // 已经装备的技能
    public skills: SkillDTO[] = [{prototype: "Iatrotechnics" , lv: 1}];

    // 所有技能等级
    public skillLevel: {[key: string]: number} = {};

    constructor(data?: SkillManagerDTO) {
        if (data) {
            this.skills = data.skills;
            this.skillLevel = data.skillLevel;
        }
        // 响应式更换角色时，重新获取技能
        setTimeout(() => {
            Rx.effect(() => {
                characterManager.data.currentCharacter
                this.skills = []
            })
        });
        return
    }

}

export const skillManager = new Manager({
    storageKey: "slaughter:game:skill",
    descrypt: Config.descrypt,
    Constructor: SkillData,
    DtoCostructor: SkillManagerDTO,
})
