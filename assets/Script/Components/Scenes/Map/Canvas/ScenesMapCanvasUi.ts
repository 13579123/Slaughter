import { _decorator, Component, find, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasUi')
export class ScenesMapCanvasUi extends Component {

    @property(Node)
    protected BackpackNode: Node = null

    // 开启设置
    protected async openSetting() {
        const manager = new CcNative.Asset.AssetManager("PrefabResource")
        const settingPrefab = await manager.load("SettingPrefab" , Prefab , true)
        const settingNode = CcNative.instantiate(settingPrefab.value)
        find("Canvas").addChild(settingNode)
    }

    // 开启背包
    protected async openBagpack() {
        this.BackpackNode.active = true
    }

}


