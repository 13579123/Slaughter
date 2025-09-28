import { Constructor, SpriteFrame } from "cc";
import { FightMapPrototype } from "../Prototype/FightMapPrototype";
import { CharacterInstance } from "../../../System/Core/Instance/CharacterInstance";
import { Rx } from "db://assets/Module/Rx";
import { createPlayerInstance } from "../../Share";

export type MapFloorType = "monster"|"reward"|"floor"|"none"

export type MapData = {
    type: MapFloorType,
    floor: () => SpriteFrame,
    icon: () => SpriteFrame,
    enter: () => void,
}

export class FightMapInstance {

    public proto: FightMapPrototype;

    public mapData: MapData[] = []

    public player: CharacterInstance = null

    constructor(Proto: Constructor<FightMapPrototype>) {
        this.proto = new Proto(this);
        this.player = Rx.reactive(createPlayerInstance())
    }

}