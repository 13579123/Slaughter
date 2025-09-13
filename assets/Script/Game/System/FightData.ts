import { Constructor } from "cc";
import { CharacterInstance } from "../../System/Core/Instance/CharacterInstance";

// 战斗数据参数
export type FightDataOption = {
    playCharacter: CharacterInstance,
}

// 战斗数据
export class FightData {

    // 玩家角色
    public playerCharacter: CharacterInstance = null;

    constructor(option: FightDataOption) {
        // 玩家角色
        this.playerCharacter = option.playCharacter
    }

}


