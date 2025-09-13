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
        const spear = new EquipmentInstance({
            lv: 1,
            quality: EquipmentQuality.Epic,
            Proto: Spear,
        })
        const node = CcNative.instantiate(this.DetailInfoPrefab)
        node.getComponent(DetailInfoPrefab).setDetail({
            content: [
                {
                    title: spear.proto.name,
                    icon: await spear.proto.icon(),
                    buttons: [
                        {
                            label: "测试" ,
                            callback: () => {
                                log('测试')
                            }
                        }
                    ]
                }
            ],
            closeCallback: () => {
                log('closeCallback')
                this.node.removeChild(node)
            }
        })
        this.node.addChild(node)
    }

}


