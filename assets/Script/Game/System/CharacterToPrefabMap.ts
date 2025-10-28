import { FightPrefab } from "db://assets/Prefabs/Components/FightPrefab/FightPrefab";
import { CharacterInstance } from "../../System/Core/Instance/CharacterInstance";
import { FightCharacterPrefab } from "db://assets/Prefabs/Components/FightPrefab/FightCharacterPrefab";

const PlayerToPrefabMap = new WeakMap<CharacterInstance , FightCharacterPrefab>()

export function getComponentByCharacter(player: CharacterInstance) {
    return PlayerToPrefabMap.get(player)
}

export function bindCharacterToComponent(player: CharacterInstance, component: FightCharacterPrefab) {
    PlayerToPrefabMap.set(player, component)
}

export function unbindCharacterComponent(player: CharacterInstance) {
    PlayerToPrefabMap.delete(player)
}