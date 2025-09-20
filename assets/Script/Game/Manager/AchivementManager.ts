import { LoadingManager } from "db://assets/Module/Manager/LoadingManager";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";
import { resourceManager } from "./ResourceManager";
import { equipmentManager } from "./EquipmentManager";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { backpackManager } from "./BackpackManager";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";

class AchivementResourceHistory {
    constructor(dto?: Partial<AchivementResourceHistory>) {
        if (!dto) return
        Object.assign(this, dto)
    }

    // 基础资源
    resource = {
        addGold: 100000,
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

}

class AchivementDTO {

    public dayTaskTime = 0

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

class AchivementData {

    public dayTaskTime = 0

    public dayTaskData = new AchivementResourceHistory()

    public achivementData = new AchivementResourceHistory()

    constructor(data?: AchivementDTO) {
        if (data) {
            if (new Date(data.dayTaskTime).toDateString() !== new Date().toDateString()) {
                this.dayTaskTime = Date.now()
                this.dayTaskData = new AchivementResourceHistory()
            } else {
                this.dayTaskTime = data.dayTaskTime
                this.dayTaskData = new AchivementResourceHistory(data.dayTaskData)
            }
            this.achivementData = new AchivementResourceHistory(data.achivementData)
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
    })
    // 监听装备获得变化
    equipmentManager.data.on("addEquipment" , (equip: EquipmentDTO) => {
        achivementManager.data.achivementData.equipHistory[equip.prototype] =
            (achivementManager.data.achivementData.equipHistory[equip.prototype] + 1) || 0
        achivementManager.data.dayTaskData.equipHistory[equip.prototype] =
            (achivementManager.data.dayTaskData.equipHistory[equip.prototype] + 1) || 0
    })
    // 添加物品
    backpackManager.data.on("addItem" , (item: ItemDTO) => {
        achivementManager.data.achivementData.itemHistory[item.prototype] +=
            (achivementManager.data.achivementData.itemHistory[item.prototype] + item.count) || 0
        achivementManager.data.dayTaskData.itemHistory[item.prototype] +=
            (achivementManager.data.dayTaskData.itemHistory[item.prototype] + item.count) || 0
    })
    // 减少物品
    backpackManager.data.on("reduceItem" , (item: ItemDTO) => {
        achivementManager.data.achivementData.useItemHistory[item.prototype] +=
            (achivementManager.data.achivementData.useItemHistory[item.prototype] + item.count) || 0
        achivementManager.data.dayTaskData.useItemHistory[item.prototype] +=
            (achivementManager.data.dayTaskData.useItemHistory[item.prototype] + item.count) || 0
    })
})