import { Sprite, SpriteFrame } from "cc"
import { ItemDTO } from "../../../System/Core/Prototype/ItemPrototype"
import { EquipmentDTO } from "../../../System/Core/Prototype/EquipmentPrototype"
import { backpackManager } from "../../Manager/BackpackManager"
import { equipmentManager } from "../../Manager/EquipmentManager"
import { resourceManager } from "../../Manager/ResourceManager"
import { message } from "../../Message/Message"

export class AchivementPrototype {

    // 名称
    public get name(): string { return "" }

    // 描述
    public get description(): string { return "" }

    // 图标
    public async icon(): Promise<SpriteFrame> {
        return null
    }

    // 进度
    public get progress(): { progress: number, maxProgress: number } {
        return { progress: 0, maxProgress: 0 }
    }

    // 开启
    public get open(): boolean { return true }

    // 奖励
    public get rewards(): {
        gold: number,
        diamond: number,
        items?: ItemDTO[],
        equipment?: EquipmentDTO[]
    } { return { gold: 0, diamond: 0, items: [], equipment: [] } }

    // 获取奖励
    public getRewards() {
        const reward = this.rewards
        if (reward.gold) resourceManager.data.addGold(reward.gold)
        if (reward.diamond) resourceManager.data.addGold(reward.diamond)
        if (reward.items)
            reward.items.forEach(item => backpackManager.data.addItem(item.prototype, item.count))
        if (reward.equipment)
            reward.equipment.forEach(equipment => equipmentManager.data.addEquipment(equipment.prototype, equipment.quality))
        message.congratulations(reward.gold || 0 , reward.diamond || 0, reward.items || [], reward.equipment || [])
        resourceManager.save()
        backpackManager.save()
        equipmentManager.save()
    }

}


