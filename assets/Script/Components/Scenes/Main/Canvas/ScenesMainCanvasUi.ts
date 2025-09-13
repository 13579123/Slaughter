import { _decorator, Component, find, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Script/Module/CcNative';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasUi')
export class ScenesMainCanvasUi extends Component {

    @property(Node)
    protected levelSelectNode: Node = null;

    protected start(): void {
        this.levelSelectNode.active = false;
    }

    // 开启设置
    protected async openSetting() {
        const manager = new CcNative.Asset.AssetManager("PrefabResource")
        const settingPrefab = await manager.load("SettingPrefab" , Prefab , true)
        const settingNode = CcNative.instantiate(settingPrefab.value)
        find("Canvas").addChild(settingNode)
    }

    // 开启关卡选择
    protected async openLevelSelect() {
        this.levelSelectNode.active = true;
    }

    // 开启背包界面
    protected async openBackpack() {
    }

    // 开启技能界面
    protected async openSkill() {
        
    }

}


