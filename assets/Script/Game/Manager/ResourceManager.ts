import { BaseEventManagerData, Manager } from "../../System/Manager";
import { Config } from "../Config";
import { achivementManager } from "./AchivementManager";

type EventType = "goldChange" | "diamondChange"

class ResourcecDTO {

    gold: number = 1000

    diamond: number = 0

    constructor(data?: ResourcecData) {
        if (data) {
            this.gold = data.gold
            this.diamond = data.diamond
        }
    }
}

export class ResourcecData extends BaseEventManagerData<EventType> {

    protected _gold: number = 10000

    public get gold() {
        return this._gold
    }

    protected _diamond: number = 1000

    public get diamond() {
        return this._diamond
    }

    constructor(data?: ResourcecDTO) {
        super()
        if (data) {
            this._gold = data.gold
            this._diamond = data.diamond 
        }
    }

    addGold(value: number) {
        this._gold += value || 0
        this.emit("goldChange" , value)
    }

    reduceGold(value: number) {
        this._gold -= value || 0
        this.emit("goldChange" , -value)
    }

    addDiamond(value: number) {
        this._diamond += value || 0
        this.emit("diamondChange" , value)
    }

    reduceDiamond(value: number) {
        this._diamond -= value || 0
        this.emit("diamondChange" , -value)
    }

}

export const resourceManager = new Manager({
    storageKey: "slaughter:game:resource",
    descrypt: Config.descrypt,
    Constructor: ResourcecData,
    DtoCostructor: ResourcecDTO,
})

try {
    // @ts-ignore
    window.resourceManager = resourceManager
} catch(e) {
}