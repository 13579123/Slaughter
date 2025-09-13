import { sp } from "cc";
import { MapEventInstance } from "../Instance/MapEventInstance";

export type MapEventDTO = {
    wight: number, // 权重
    prototype: string, // 事件原型
}

export class MapEventPrototype {

    public get name() {
        return ""
    }

    public get description() {
        return ""
    }

    public constructor(public readonly instance: MapEventInstance) {
    }

    // 获取图标骨骼数据
    public async skeletonData(): Promise<sp.SkeletonData> {
        return null
    }

    // 选择事件回调
    public select() {
    }

}