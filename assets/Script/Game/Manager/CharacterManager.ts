import { CharacterDTO } from "../../System/Core/Prototype/CharacterPrototype";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { BaseEventManagerData, Manager } from "../../System/Manager";
import { getCharacterKey } from "../../System/Manager/CharacterManager";
import { EquipmentType } from "../../System/Core/Prototype/EquipmentPrototype";
import { Config } from "../Config";

type EventType = "changeCharacter"|"addCharacter"|"addExp"

class CharacterManagerDTO {

    public lv: number = 1

    public characters: string[] = ["Brave"]

    public currentCharacter: string = "Brave"

    constructor(data?: CharacterData) {
        if (data) {
            this.characters = data.characters
            this.currentCharacter = data.currentCharacter
            this.lv = data.lv
        }
    }

}

class CharacterData extends BaseEventManagerData<EventType> {

    public lv: number = 1

    public exp: number = 0

    public characters: string[] = ["Brave"]

    public currentCharacter: string = "Brave"

    constructor(data?: CharacterManagerDTO) {
        super()
        if (data) {
            this.lv = data.lv
            this.characters = data.characters
            if (data.currentCharacter)
                this.currentCharacter = data.currentCharacter
        }
    }

    // 最大经验
    public get maxExp(): number {
        return this.needExp(this.lv)
    }

    // 获取需要的经验
    public needExp(lv: number) {
        if (lv < 10) return 100 + (lv -1) * 50
        if (lv < 20) return 300 + (lv - 1) * 100
        if (lv < 30) return 500 + (lv - 1) * 250
        if (lv < 40) return 1000 + (lv - 1) * 500
        if (lv < 50) return 2000 + (lv - 1) * 700
        if (lv < 60) return 4000 + (lv - 1) * 1500
        if (lv < 70) return 6000 + (lv - 1) * 2000
        if (lv < 80) return 8000 + (lv - 1) * 3500
        if (lv < 90) return 10000 + (lv - 1) * 5000
        if (lv < 100) return 15000 + (lv - 1) * 7000
        return 1
    }

    // 添加经验
    public addExp(exp: number) {
        if (this.lv >= 100) {
            this.lv = 100
            this.exp = 0
            return
        }
        this.exp += exp
        this.emit("addExp" , exp)
        while (this.exp >= this.maxExp) {
            this.exp -= this.maxExp
            this.lv++
        }
        if (this.lv > 100) {
            this.lv = 100
            this.exp = 0
        }
    }

    // 添加角色
    public addCharacter(prototype: string) {
        this.characters.push(prototype)
        this.emit("addCharacter" , prototype)
    }

    // 切换角色
    public switchCharacter(prototype: string) {
        for (let i = 0; i < this.characters.length; i++) {
            const character = this.characters[i];
            if (character === prototype) {
                const old = this.currentCharacter
                this.currentCharacter = character
                this.emit("changeCharacter" , this.currentCharacter , old)
                return true
            }
        }
        return false
    }

}

export const characterManager = new Manager({
    storageKey: "slaughter:game:character",
    descrypt: Config.descrypt,
    Constructor: CharacterData,
    DtoCostructor: CharacterManagerDTO,
})

try {
    // @ts-ignore
    window.characterManager = characterManager
} catch(e) {
}