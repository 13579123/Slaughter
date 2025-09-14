import { SpriteFrame } from "cc"
import { ItemInstance } from "./../Instance/ItemInstance"

export type ItemDTO = {
    prototype: string,
    count: number,
}

export class ItemPrototype {

    public get name() {
        return ""
    }

    public get description() {
        return ""
    }

    public get canUse() {
        return false
    }

    public constructor(public readonly instance: ItemInstance) {
    }

    // 图标信息 Sprite
    public async icon(): Promise<SpriteFrame> {
        return Promise.resolve(null);
    }

    public async use(number: number = 1) {
    }
}


