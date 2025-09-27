import { LoadingManager } from "db://assets/Module/Manager/LoadingManager";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";
import { resourceManager } from "./ResourceManager";
import { equipmentManager } from "./EquipmentManager";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { backpackManager } from "./BackpackManager";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";
import { getAchivement, getAchivementKey, getAllAchivements, isDayTask } from "../System/Manager/AchivementManager";
import { Rx } from "db://assets/Module/Rx";
import { message } from "../Message/Message";

class AchivementResourceHistory {
    constructor(dto?: Partial<AchivementResourceHistory>) {
        if (!dto) return
        Object.assign(this, dto)
    }

    // 基础资源
    resource = {
        addGold: 0,
        addDiamond: 0,
        reduceGold: 0,
        reduceDiamond: 0,
    }

    // 击杀记录
    kill: {[key: string]: number} = {
    }

    // 获取物品记录
    itemHistory: {[key: string]: number} = {
    }

    // 使用物品记录
    useItemHistory: {[key: string]: number} = {
    }

    // 获取装备记录
    equipHistory: {[key: string]: number} = {
    }

    // 已经领取的任务
    hasGetReward: string[] = []

    // 已经完成的任务
    hasComplete: string[] = []

}

class AchivementDTO {

    public dayTaskTime = Date.now()

    public dayTaskData = new AchivementResourceHistory()

    public achivementData = new AchivementResourceHistory()

    constructor(data?: AchivementData) {
        if (data) {
            this.dayTaskTime = data.dayTaskTime
            this.dayTaskData = data.dayTaskData
            this.achivementData = data.achivementData
        }
    }

}

export class AchivementData {

    public dayTaskTime = Date.now()

    public dayTaskData = new AchivementResourceHistory()

    public achivementData = new AchivementResourceHistory()

    constructor(data?: AchivementDTO) {
        if (data) {
            if (
                new Date(data.dayTaskTime).toDateString() !== new Date().toDateString() || 
                data.dayTaskTime === 0 || 
                this.dayTaskTime === 0
            ) {
                this.dayTaskTime = Date.now()
                this.dayTaskData = new AchivementResourceHistory()
            } else {
                this.dayTaskTime = data.dayTaskTime
                this.dayTaskData = new AchivementResourceHistory(data.dayTaskData)
            }
            this.achivementData = new AchivementResourceHistory(data.achivementData)
        }
        setTimeout(() => {
            Array.from(getAllAchivements()).forEach((achivement) => {
                const achivementKey = getAchivementKey(achivement)
                if (this.hasComplete(achivementKey) || this.hasGetReward(achivementKey)) return
                let stop = false
                const runner = Rx.effect(() => {
                    const progress = achivement.progress
                    if (progress.progress / progress.maxProgress >= 1) {
                        this.completeTask(achivementKey)
                        message.taskNotify(achivement)
                        stop = true
                        if (runner) runner.effect.stop()
                    }
                })
                if (stop) runner.effect.stop()
            })
        })
        return
    }

    hasGetReward(key: string) {
        if (isDayTask(key)) {
            if (this.dayTaskData.hasGetReward.indexOf(key) !== -1) return true
        } else {
            if (this.achivementData.hasGetReward.indexOf(key) !== -1) return true
        }
        return false
    }

    hasComplete(key: string) {
        if (isDayTask(key)) {
            if (this.dayTaskData.hasComplete.indexOf(key) !== -1) return true
        } else {
            if (this.achivementData.hasComplete.indexOf(key) !== -1) return true
        }
        return false
    }

    completeTask(key: string) {
        if (isDayTask(key)) {
            if (this.dayTaskData.hasComplete.indexOf(key) !== -1) return
            this.dayTaskData.hasComplete.push(key)
        } else {
            if (this.achivementData.hasComplete.indexOf(key) !== -1) return
            this.achivementData.hasComplete.push(key)
        }
    }

    getRewardTask(key: string) {
        if (isDayTask(key)) {
            // 已经获取过奖励
            if (this.dayTaskData.hasGetReward.indexOf(key) !== -1) return
            // 添加奖励
            const achivement = getAchivement(key)
            if (!achivement) return
            achivement.getRewards()
            this.dayTaskData.hasGetReward.push(key)
        } else {
            // 已经获取过奖励
            if (this.achivementData.hasGetReward.indexOf(key) !== -1) return
            // 添加奖励
            const achivement = getAchivement(key)
            if (!achivement) return
            achivement.getRewards()
            this.achivementData.hasGetReward.push(key)
        }
    }

}

export const achivementManager = new Manager({
    storageKey: "slaughter:game:achivement",
    descrypt: Config.descrypt,
    Constructor: AchivementData,
    DtoCostructor: AchivementDTO,
})

LoadingManager.addLoadingQueue(async () => {
    achivementManager.data
    // 监听资源变化
    resourceManager.data.on("goldChange" , num => {
        if (num > 0) {
            achivementManager.data.achivementData.resource.addGold += num
            achivementManager.data.dayTaskData.resource.addGold += num
        }
        else {
            achivementManager.data.achivementData.resource.reduceGold += num
            achivementManager.data.dayTaskData.resource.reduceGold += num
        }
        achivementManager.save()
    })
    resourceManager.data.on("diamondChange" , num => {
        if (num > 0) {
            achivementManager.data.achivementData.resource.addDiamond += num
            achivementManager.data.dayTaskData.resource.addDiamond += num
        }
        else {
            achivementManager.data.achivementData.resource.reduceDiamond += num
            achivementManager.data.dayTaskData.resource.reduceDiamond += num
        }
        achivementManager.save()
    })
    // 监听装备获得变化
    equipmentManager.data.on("addEquipment" , (equip: EquipmentDTO) => {
        achivementManager.data.achivementData.equipHistory[equip.prototype] =
            (achivementManager.data.achivementData.equipHistory[equip.prototype] + 1) || 0
        achivementManager.data.dayTaskData.equipHistory[equip.prototype] =
            (achivementManager.data.dayTaskData.equipHistory[equip.prototype] + 1) || 0
        achivementManager.save()
    })
    // 添加物品
    backpackManager.data.on("addItem" , (item: ItemDTO) => {
        achivementManager.data.achivementData.itemHistory[item.prototype] +=
            (achivementManager.data.achivementData.itemHistory[item.prototype] + item.count) || 0
        achivementManager.data.dayTaskData.itemHistory[item.prototype] +=
            (achivementManager.data.dayTaskData.itemHistory[item.prototype] + item.count) || 0
        achivementManager.save()
    })
    // 减少物品
    backpackManager.data.on("reduceItem" , (item: ItemDTO) => {
        achivementManager.data.achivementData.useItemHistory[item.prototype] +=
            (achivementManager.data.achivementData.useItemHistory[item.prototype] + item.count) || 0
        achivementManager.data.dayTaskData.useItemHistory[item.prototype] +=
            (achivementManager.data.dayTaskData.useItemHistory[item.prototype] + item.count) || 0
        achivementManager.save()
    })
})