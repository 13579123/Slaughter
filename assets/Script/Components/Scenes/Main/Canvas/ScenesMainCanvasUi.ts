import { _decorator, Component, find, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasUi')
export class ScenesMainCanvasUi extends Component {

    // 关卡选择节点
    @property(Node)
    protected levelSelectNode: Node = null;

    // 背包节点
    @property(Node)
    protected backpackNode: Node = null;
    
    // 技能节点
    @property(Node)
    protected skillNode: Node = null;

    @property(Node)
    protected achivementNode: Node = null;

    // 初始化
    protected start(): void {
        this.levelSelectNode.active = false;
        this.backpackNode.active = false;
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
        this.backpackNode.active = true
    }

    // 开启技能界面
    protected async openSkill() {
        this.skillNode.active = true
    }

    // 开启成就界面
    protected async openAchievement() {
        this.achivementNode.active = true
    }

}


