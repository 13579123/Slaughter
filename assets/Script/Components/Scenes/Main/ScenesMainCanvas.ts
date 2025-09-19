import { _decorator, Component, log, Node, Prefab } from 'cc';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { EquipmentInstance } from '../../../System/Core/Instance/EquipmentInstance';
import { EquipmentQuality } from '../../../System/Core/Prototype/EquipmentPrototype';
import { createPlayerInstance } from '../../../Game/Share';
import { FightPrefab } from 'db://assets/Prefabs/Components/FightPrefab/FightPrefab';
import { CcNative } from 'db://assets/Module/CcNative';
import { Rx } from 'db://assets/Module/Rx';
import { DefenseUp } from 'db://assets/Mod/Base/Prototype/Buff/DefenseUp';
import { CharacterInstance } from '../../../System/Core/Instance/CharacterInstance';
import { Brave } from 'db://assets/Mod/Base/Prototype/Player/Brave';
import { toRaw } from 'db://assets/Module/Rx/reactivity';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvas')
export class ScenesMainCanvas extends Component {

    async start() {
        const fightPrefab = await (new CcNative.Asset.AssetManager("PrefabResource"))
            .load("FightPrefab/FightPrefab" , Prefab)
        const node = CcNative.instantiate(fightPrefab.value)
        this.node.addChild(node)
        const leftC = Rx.reactive(createPlayerInstance())
        const rightC = Rx.reactive(new CharacterInstance({
            lv: 1,
            Proto: Brave,
        }))
        const successPos = await node.getComponent(FightPrefab)
        .setFightAndStart({
            player: "left",
            leftCharacter: leftC,
            rightCharacter: rightC,
        })
        this.node.removeChild(node)
        console.log(successPos + " 胜利" )
    }

}


