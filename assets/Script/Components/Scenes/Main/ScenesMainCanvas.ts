import { _decorator, Component, log, Node, Prefab } from 'cc';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { EquipmentInstance } from '../../../System/Core/Instance/EquipmentInstance';
import { EquipmentQuality } from '../../../System/Core/Prototype/EquipmentPrototype';
import { createPlayerInstance } from '../../../Game/Share';
import { FightPrefab } from 'db://assets/Prefabs/Components/FightPrefab/FightPrefab';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvas')
export class ScenesMainCanvas extends Component {

    async start() {
        const p = createPlayerInstance()
        const p2 = createPlayerInstance()
        this.node.getChildByName("FightPrefab").getComponent(FightPrefab)
        .setFightAndStart({
            player: "left",
            leftCharacter: p,
            rightCharacter: p2,
        })
    }

}


