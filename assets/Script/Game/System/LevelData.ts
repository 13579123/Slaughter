import { Constructor } from "cc";
import { CharacterInstance } from "../../System/Core/Instance/CharacterInstance";
import { MapEventDTO } from "../../System/Core/Prototype/MapEventPrototype";
import { MapEventInstance } from "../../System/Core/Instance/MapEventInstance";
import { getMapEventPrototype } from "../../System/Manager/MapEventManager";
import { Rx } from "../../Module/Rx";

// 战斗数据参数
export type LevelDataOption = {
    // 可能出现的事件列表
    mapEventList: MapEventDTO[],
    // 玩家角色数据
    playCharacter: CharacterInstance,
}

// 关卡数据
export class LevelData {

    // 玩家角色
    public readonly playerCharacter: CharacterInstance = null;

    // 可能出现的事件列表
    public readonly mapEventList: {event: MapEventInstance , wight: number}[] = [];

    constructor(option: LevelDataOption) {
        // 玩家角色
        this.playerCharacter = option.playCharacter
        // 可能出现的事件列表
        this.mapEventList = option.mapEventList.map((mapEvent) => {
            return {
                event: new MapEventInstance({
                    Proto: getMapEventPrototype(mapEvent.prototype)
                }),
                wight: mapEvent.wight
            }
        })
    }

}


