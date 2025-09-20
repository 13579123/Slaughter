import { Sprite, SpriteFrame } from "cc"
import { ItemDTO } from "../../../System/Core/Prototype/ItemPrototype"
import { EquipmentDTO } from "../../../System/Core/Prototype/EquipmentPrototype"

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
    public get progress(): {progress: number , maxProgress: number } { 
        return { progress: 0 , maxProgress: 0 } 
    }

    // 奖励
    public get rewards(): {
        gold: number,
        diamond: number,
        items?: ItemDTO[],
        equipment?: EquipmentDTO[]
    } { return { gold: 0 , diamond: 0 , items: [] , equipment: [] } }

}


