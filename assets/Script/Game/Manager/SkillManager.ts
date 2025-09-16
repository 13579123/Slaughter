import { Iatrotechnics } from "db://assets/Mod/Base/Prototype/Skill/Iatrotechnics";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";
import { message } from "../Message/Message";
import { getSkillUpLevelMaterial, isSkillBelongToPlayer } from "../System/SkillConfig";
import { characterManager } from "./CharacterManager";
import { resourceManager } from "./ResourceManager";

class SkillManagerDTO {

    // 已经装备的技能
    public skills: string[] = [];

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
    public skills: string[] = ["Iatrotechnics"];

    // 所有技能等级
    public skillLevel: {[key: string]: number} = {
        "Iatrotechnics": 1
    };

    constructor(data?: SkillManagerDTO) {
        if (data) {
            this.skills = data.skills;
            this.skillLevel = data.skillLevel;
        }
        // 响应式更换角色时，重新获取技能
        characterManager.data.on("changeCharacter" , () => {
            characterManager.data.currentCharacter
            this.skills = []
        })
        return
    }

    // 获取技能等级
    public getSkillLevel(prototype: string) {
        return this.skillLevel[prototype] || 0
    }

    // 卸下技能
    public unloadSkill(prototype: string) {
        let index = -1
        this.skills.forEach((skillProto , i) => {
            if (skillProto === prototype) 
                index = i
        })
        if (index !== -1) this.skills.splice(index , 1)
    }

    // 装备技能
    public equipSkill(prototype: string) {
        if (this.skills.length >= 3) {
            message.toast("技能数量已达到上限")
            return
        }
        if (this.skills[prototype] <= 0) {
            message.toast("该技能还未学习")
            return
        }
        const is = isSkillBelongToPlayer(
            prototype , 
            characterManager.data.currentCharacter.prototype
        )
        if (is) this.skills.push(prototype)
        else message.toast("该技能不属于当前角色")
    }

    // 升级技能
    public upgradeSkill(prototype: string) {
        // 获取技能等级
        const level = this.getSkillLevel(prototype)
        if (level >= 10) {
            message.toast("技能等级已达到上限")
            return
        }
        // 获取升级材料
        const upMaterial = getSkillUpLevelMaterial(prototype , level)
        if (upMaterial.gold > resourceManager.data.gold) {
            message.toast("金币不足")
            return
        }
        if (upMaterial.diamond > resourceManager.data.diamond) {
            message.toast("钻石不足")
            return
        }
        // 减少资源
        resourceManager.data.reduceGold(upMaterial.gold)
        resourceManager.data.reduceDiamond(upMaterial.diamond)
        // 升级技能
        this.skillLevel[prototype] = (this.skillLevel[prototype] || 0) + 1
        // 保存
        skillManager.save()
        resourceManager.save()
    }

}

export const skillManager = new Manager({
    storageKey: "slaughter:game:skill",
    descrypt: Config.descrypt,
    Constructor: SkillData,
    DtoCostructor: SkillManagerDTO,
})
