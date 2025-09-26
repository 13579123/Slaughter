import { _decorator, Component, Label, Node, Sprite } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { AchivementPrototype } from 'db://assets/Script/Game/System/Prototype/AchivementPrototype';
const { ccclass, property } = _decorator;

@ccclass('MessageTaskNotifyPrefab')
export class MessageTaskNotifyPrefab extends ExtensionComponent {

    public async setNotifyInfo(achivement: AchivementPrototype) {
        const iconSprite = this.node.getChildByName("Icon").getComponent(Sprite);
        const titleLabel = this.node.getChildByName("Title").getComponent(Label);
        const descriptionLabel = this.node.getChildByName("Description").getComponent(Label);
        // 设置内容
        titleLabel.string = achivement.name;
        descriptionLabel.string = achivement.description;
        achivement.icon().then(spriteFrame => {
            iconSprite.spriteFrame = spriteFrame;
        })
        // 播放动画
        await new Promise(res => {
            this.setAutoInterval(() => {
                this.node.setPosition(
                    this.node.position.x + 12,
                    this.node.position.y
                )
            } , { count: 30 , timer: 13 , complete: () => res(null) })
        })
        await new Promise(res => this.setAutoInterval(_ => res(null) , {count: 1 , timer: 2000}))
        await new Promise(res => {
            this.setAutoInterval(() => {
                this.node.setPosition(
                    this.node.position.x - 12,
                    this.node.position.y
                )
            } , { count: 30 , timer: 13 , complete: () => res(null) })
        })
    }

}


