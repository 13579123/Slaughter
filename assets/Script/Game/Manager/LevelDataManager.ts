import { LanguageType, AllLanguageType } from "db://assets/Module/Language/LangaugeType";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";
import { BackpackData } from "./BackpackManager";

class LevelDataDTO {

    // 主要关卡层数
    public mainLevelFloor: number = 0

    // 携带的药品
    public medicineList: string[] = []

    constructor(data?: LevelData) {
        if (data) {
            this.mainLevelFloor = data.mainLevelFloor || 0
            this.medicineList = data.medicineList || []
        }
    }
}

export class LevelData {

    // 主要关卡层数
    public mainLevelFloor: number = 0

    // 携带的药品
    public medicineList: string[] = []

    constructor(data?: LevelDataDTO) {
        if (data) {
            this.mainLevelFloor = data.mainLevelFloor || 0
            this.medicineList = data.medicineList || []
        }
    }

    // 添加药品
    public addMedicine(medicine: string , backpackManager: Manager<BackpackData>) {
        if (backpackManager.data.items.find(item => item.prototype === medicine)?.count <= 0)
            return false
        this.medicineList.push(medicine)
        return true
    }

    // 移除药品
    public removeMedicine(medicine: string) {
        const index = this.medicineList.indexOf(medicine)
        if (index === -1) return false
        this.medicineList.splice(index, 1)
        return true
    }

}

export const levelDataManager = new Manager({
    storageKey: "slaughter:game:level_data",
    descrypt: Config.descrypt,
    Constructor: LevelData,
    DtoCostructor: LevelDataDTO,
})