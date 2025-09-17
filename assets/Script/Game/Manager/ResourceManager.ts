import { BaseEventManagerData, Manager } from "../../System/Manager";
import { Config } from "../Config";

type EventType = "goldChange" | "diamondChange"

class ResourcecDTO {

    gold: number = 1000

    diamond: number = 0

    // 历史获取资源
    public history = { 
        addGold: 0 , reduceGold: 0 , addDiamond: 0 , reduceDiamond: 0
    }

    constructor(data?: ResourcecData) {
        if (data) {
            this.gold = data.gold
            this.diamond = data.diamond
            this.history = data.history
        }
    }
}

class ResourcecData extends BaseEventManagerData<EventType> {

    protected _gold: number = 10000

    public get gold() {
        return this._gold
    }

    protected _diamond: number = 1000

    public get diamond() {
        return this._diamond
    }

    // 历史获取资源
    public history = { 
        addGold: 0 , reduceGold: 0 , addDiamond: 0 , reduceDiamond: 0 
    }

    constructor(data?: ResourcecDTO) {
        super()
        if (data) {
            this._gold = data.gold
            this._diamond = data.diamond 
            this.history = data.history
        }
        this.on("goldChange" , (num) => {
            if (num > 0) this.history.addGold += num
            else this.history.reduceGold -= num
        })
        this.on("diamondChange" , (num) => {
            if (num > 0) this.history.addDiamond += num
            else this.history.reduceDiamond -= num
        })
    }

    addGold(value: number) {
        this._gold += value
        this.emit("goldChange" , value)
    }

    reduceGold(value: number) {
        this._gold -= value
        this.emit("goldChange" , -value)
    }

    addDiamond(value: number) {
        this._diamond += value
        this.emit("diamondChange" , value)
    }

    reduceDiamond(value: number) {
        this._diamond -= value
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