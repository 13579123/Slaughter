import { AllLanguageType, LanguageType } from "../../Module/Language/LangaugeType";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";

type ResourceEvent = "goldChange" | "diamondChange"

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

class ResourcecData {

    protected _gold: number = 1000

    public get gold() {
        return this._gold
    }

    protected _diamond: number = 0

    public get diamond() {
        return this._diamond
    }

    // 历史获取资源
    public history = { 
        addGold: 0 , reduceGold: 0 , addDiamond: 0 , reduceDiamond: 0 
    }

    constructor(data?: ResourcecDTO) {
        if (data) {
            this._gold = data.gold
            this._diamond = data.diamond 
            this.history = data.history
        }
        this.registerResourceChangeListener("goldChange" , (num) => {
            if (num > 0) this.history.addGold += num
            else this.history.reduceGold -= num
        })
        this.registerResourceChangeListener("diamondChange" , (num) => {
            if (num > 0) this.history.addDiamond += num
            else this.history.reduceDiamond -= num
        })
    }

    addGold(value: number) {
        this._gold += value
        this.resourceChangeListeners["goldChange"]?.forEach(callback => callback(value))
    }

    reduceGold(value: number) {
        this._gold -= value
        this.resourceChangeListeners["goldChange"]?.forEach(callback => callback(-value))
    }

    addDiamond(value: number) {
        this._diamond += value
        this.resourceChangeListeners["diamondChange"]?.forEach(callback => callback(value))
    }

    reduceDiamond(value: number) {
        this._diamond -= value
        this.resourceChangeListeners["diamondChange"]?.forEach(callback => callback(-value))
    }

    protected resourceChangeListeners: { [key in ResourceEvent]?: Array<(num: number) => void> } = {}

    registerResourceChangeListener(e: ResourceEvent , callback: (num: number) => void) {
        if (!this.resourceChangeListeners[e]) {
            this.resourceChangeListeners[e] = []
        }
        this.resourceChangeListeners[e]!.push(callback)
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