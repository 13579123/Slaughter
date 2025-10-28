import { _decorator, Component, find, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { BackpackPrefab } from 'db://assets/Prefabs/Components/BackpackPrefab';
import { TaskPrefab, TaskType } from 'db://assets/Prefabs/Components/TaskPrefab';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasUi')
export class ScenesMainCanvasUi extends Component {

    // 关卡选择节点
    @property(Node)
    protected levelSelectNode: Node = null;

    // 背包预制体
    @property(Prefab)
    protected backpackPrefab: Prefab = null;
    
    // 技能节点
    @property(Node)
    protected skillNode: Node = null;

    @property(Prefab)
    protected taskPrefab: Prefab = null;

    @property(Node)
    protected strengthNode: Node = null;

    @property(Node)
    protected placeholderNode: Node = null;

    // 初始化
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
        const node = CcNative.instantiate(this.backpackPrefab)
        node.getComponent(BackpackPrefab).onClose(() => {
            if (node && node.isValid) node.destroy()
        })
        this.placeholderNode.addChild(node)
    }

    // 开启技能界面
    protected async openSkill() {
        this.skillNode.active = true
    }

    // 开启成就界面
    protected async openAchievement() {
        const node = CcNative.instantiate(this.taskPrefab)
        const taskPrefab = node.getComponent(TaskPrefab)
        taskPrefab.taskType = TaskType.achivement
        node.getComponent(TaskPrefab).onClose(() => {
            if (node && node.isValid) node.destroy()
        })
        this.placeholderNode.addChild(node)
    }

    // 开启每日任务
    protected async openDailyTask() {
        const node = CcNative.instantiate(this.taskPrefab)
        const taskPrefab = node.getComponent(TaskPrefab)
        taskPrefab.taskType = TaskType.dayTask
        node.getComponent(TaskPrefab).onClose(() => {
            if (node && node.isValid) node.destroy()
        })
        this.placeholderNode.addChild(node)
    }

    // 开启强化界面
    protected async openStrength() {
        this.strengthNode.active = true
    }

}


