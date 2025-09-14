import { _decorator, Component, log, Node, Prefab } from 'cc';
import { CcNative } from '../../../Module/CcNative';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { EquipmentInstance } from '../../../System/Core/Instance/EquipmentInstance';
import { Spear } from 'db://assets/Mod/Base/Equipment/Spear';
import { EquipmentQuality } from '../../../System/Core/Prototype/EquipmentPrototype';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvas')
export class ScenesMainCanvas extends Component {

    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null;

    async start() {
    }

}


