import { _decorator, Button, Component, Enum, instantiate, Label, Node, ScrollView, Sprite } from 'cc';
import { getAchivement, getAchivementKey, getAllAchivements, isDayTask } from '../../Script/Game/System/Manager/AchivementManager';
import { AchivementPrototype } from '../../Script/Game/System/Prototype/AchivementPrototype';
import { ModuleProgressPrefab } from '../../Module/Prefabs/ModuleProgressPrefab';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
import { achivementManager } from '../../Script/Game/Manager/AchivementManager';
import { LanguageManager } from '../../Module/Language/LanguageManager';
import { settingManager } from '../../Script/Game/Manager/SettingManager';
const { ccclass, property } = _decorator;

export const TaskType = Enum({ dayTask: "dayTask" , achivement: "achievement" });

@ccclass('TaskPrefab')
export class TaskPrefab extends ExtensionComponent {

    @property({type: TaskType})
    public taskType: string = "achievement"

    protected start(): void {
        if (this.taskType == "dayTask") {
            this.initDayTask()
        }
        else if (this.taskType == "achievement") {
            this.initAchivement()
        }
        return
    }

    protected initDayTask() {
        // 容器节点
        const contentNode = this.node.getChildByName("Container").getComponent(ScrollView).content
        // 绑定展示
        const tempItemNode = contentNode.getChildByName("TemAchivement")
        this.effect(() => {
            // 清空内容节点
            contentNode.removeAllChildren()
            // 获取所有成就
            const allAchivement = Array.from(getAllAchivements())
            // 遍历成就
            for (let i = 0; i < allAchivement.length; i++) {
                const achivement = allAchivement[i]
                if (!isDayTask(achivement) || !achivement.open || achivementManager.data.hasGetReward(getAchivementKey(achivement))) continue
                // 克隆节点
                const itemNode = instantiate(tempItemNode)
                this.initNode(itemNode, achivement)
                contentNode.addChild(itemNode)
            }
        })
    }

    protected initAchivement() {
        // 容器节点
        const contentNode = this.node.getChildByName("Container").getComponent(ScrollView).content
        // 绑定展示
        const tempItemNode = contentNode.getChildByName("TemAchivement")
        this.effect(() => {
            // 清空内容节点
            contentNode.removeAllChildren()
            // 获取所有成就
            const allAchivement = Array.from(getAllAchivements())
            // 遍历成就
            for (let i = 0; i < allAchivement.length; i++) {
                const achivement = allAchivement[i]
                if (isDayTask(achivement) || !achivement.open) continue
                // 克隆节点
                const itemNode = instantiate(tempItemNode)
                this.initNode(itemNode, achivement)
                contentNode.addChild(itemNode)
            }
        })
    }

    // 初始化节点
    protected initNode(node: Node, achivement: AchivementPrototype) {
        const titleLabel = node.getChildByName("Name").getComponent(Label)
        const sprite = node.getChildByName("Icon").getComponent(Sprite)
        const descriptionLabel = node.getChildByName("Description").getComponent(Label)
        const progressPrefab = node.getChildByName("Progress").getComponent(ModuleProgressPrefab)
        const getRewardBtn = node.getChildByName("GetReward").getComponent(Button)
        const progressLabel = node.getChildByName("ProgressLabel").getComponent(Label)
        const buttonNode = node.getChildByName("GetReward")

        titleLabel.string = achivement.name
        descriptionLabel.string = achivement.description
        achivement.icon().then(spriteFrame => sprite.spriteFrame = spriteFrame)
        progressPrefab.setProgress(
            Math.min(1, achivement.progress.progress / achivement.progress.maxProgress)
        )
        progressLabel.string = `${Math.min(100, achivement.progress.progress / achivement.progress.maxProgress * 100).toFixed(2)}%`
        buttonNode.getChildByName("Label").getComponent(Label).string = LanguageManager.getEntry("GetReward").getValue(
            settingManager.data.language
        )

        const progress = achivement.progress
        if (
            progress.progress / progress.maxProgress >= 1 && 
            !achivementManager.data.hasGetReward(getAchivementKey(achivement))
        ) getRewardBtn.node.active = true
        else getRewardBtn.node.active = false

        getRewardBtn.node.on(Button.EventType.CLICK, () => {
            if (achivement.progress.progress / achivement.progress.maxProgress >= 1)
                achivementManager.data.getRewardTask(getAchivementKey(achivement))
            achivementManager.save()
        })
    }

    // 关闭回调
    protected _onClose: Function = () => {}
    public onClose(fn: Function) {
        this._onClose = fn
    }

    // 关闭成就
    protected closeAchivement() {
        this.node.active = false
        this._onClose()
    }

}


