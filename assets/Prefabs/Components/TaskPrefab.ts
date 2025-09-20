import { _decorator, Button, Component, instantiate, Label, Node, ScrollView, Sprite } from 'cc';
import { getAllAchivements, isDayTask } from '../../Script/Game/System/Manager/AchivementManager';
import { AchivementPrototype } from '../../Script/Game/System/Prototype/AchivementPrototype';
import { ModuleProgressPrefab } from '../../Module/Prefabs/ModuleProgressPrefab';
const { ccclass, property } = _decorator;

@ccclass('TaskPrefab')
export class TaskPrefab extends Component {

    protected start(): void {
        // 容器节点
        const contentNode = this.node.getChildByName("Container").getComponent(ScrollView).content
        // 绑定展示
        const tempItemNode = contentNode.getChildByName("TemAchivement")
        // 清空内容节点
        contentNode.removeAllChildren()
        // 获取所有成就
        const allAchivement = Array.from(getAllAchivements())
        // 遍历成就
        for (let i = 0; i < allAchivement.length; i++) {
            const achivement = allAchivement[i]
            if (isDayTask(achivement)) continue
            // 克隆节点
            const itemNode = instantiate(tempItemNode)
            this.initNode(itemNode, achivement)
            contentNode.addChild(itemNode)
        }
    }

    // 初始化节点
    protected initNode(node: Node , achivement: AchivementPrototype) {
        const titleLabel = node.getChildByName("Name").getComponent(Label)
        const sprite = node.getChildByName("Icon").getComponent(Sprite)
        const descriptionLabel = node.getChildByName("Description").getComponent(Label)
        const progressPrefab = node.getChildByName("Progress").getComponent(ModuleProgressPrefab)
        const getRewardBtn = node.getChildByName("GetReword").getComponent(Button)
        const progressLabel = node.getChildByName("ProgressLabel").getComponent(Label)

        titleLabel.string = achivement.name
        descriptionLabel.string = achivement.description
        achivement.icon().then(spriteFrame => sprite.spriteFrame = spriteFrame)
        progressPrefab.setProgress(achivement.progress.progress / achivement.progress.maxProgress)
        progressLabel.string = `${(achivement.progress.progress / achivement.progress.maxProgress * 100).toFixed(2)}%`

        const progress = achivement.progress
        if (progress.progress / progress.maxProgress >= 1) getRewardBtn.node.active = true
        else getRewardBtn.node.active = false

        getRewardBtn.node.on(Button.EventType.CLICK , () => {
        })
    }

    // 关闭成就
    protected closeAchivement() {
        this.node.active = false
    }

}


