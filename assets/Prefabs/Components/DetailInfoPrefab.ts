import { _decorator, Button, Component, instantiate, Label, Node, NodeEventType, RichText, ScrollView, Sprite, SpriteFrame } from 'cc';
import { Extension } from '../../Script/Module/Extension';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { ItemInstance } from '../../Script/System/Core/Instance/ItemInstance';
import { EquipmentInstance } from '../../Script/System/Core/Instance/EquipmentInstance';
import { EquipmentItemPrefab } from './EquipmentItemPrefab';
const { ccclass, property } = _decorator;

type DetailContainer = {
    title: string,
    // 物品或者装备图片
    icon: SpriteFrame,
    // 方框图标
    boxIcon?: SpriteFrame,
    // 右侧文字 RichText
    rightMessage?: string,
    // 底部文字 RichText
    bottomMessage?: string,
    // 按钮列表
    buttons?: { label: string, callback: (close: Function) => void }[],
}

export type DetailInfoSetOption = {
    // 内容列表，最多两个
    content: DetailContainer[],
    // 关闭回调
    closeCallback?: () => void
}

@ccclass('DetailInfoPrefab')
export class DetailInfoPrefab extends ExtensionComponent {

    protected closeCallback: () => void = null

    // 设置详情
    public setDetail(option: DetailInfoSetOption) {
        this.node.active = true
        this.closeCallback = option.closeCallback
        const only = this.node.getChildByName("Only")
        const comparison = this.node.getChildByName("Comparison")
        option.content = option.content.filter(item => item)
        if (option.content.length < 1) this.closeDetail()
        else if (option.content.length < 2) {
            only.active = true
            comparison.active = false
            this.setDetailData(option.content[0], only.children[0])
        } else {
            only.active = false
            comparison.active = true
            this.setDetailData(option.content[0], comparison.children[0])
            this.setDetailData(option.content[1], comparison.children[1])
        }
    }

    // 设置详情数据
    protected setDetailData(container: DetailContainer, settingNode: Node) {
        // 标题
        settingNode.getChildByName("Title").getComponent(Label).string = container.title
        // 右侧信息
        settingNode.getChildByName("RightMessage")
            .getComponent(ScrollView)
            .content.getChildByName("item")
            .getComponent(RichText).string = container.rightMessage || ""
        // 下侧信息
        settingNode.getChildByName("BottomMessage")
            .getComponent(ScrollView)
            .content.getChildByName("item")
            .getComponent(RichText).string = container.bottomMessage || ""
        // 生成按钮
        const buttonsNode = settingNode.getChildByName("Buttons")
        const temp = buttonsNode.children[0]
        buttonsNode.removeAllChildren()
        temp.parent = null
        if (container.buttons) {
            container.buttons.forEach((item, index) => {
                if (!item) return
                const button = instantiate(temp)
                button.on(Button.EventType.CLICK, () => item.callback(this.closeDetail))
                button.getChildByName("Label").getComponent(Label).string = item.label
                buttonsNode.addChild(button)
            })
        }
        // 图标信息
        if (container.boxIcon) {
            settingNode.getChildByName("Icon")
                .getComponent(Sprite).spriteFrame = container.boxIcon
        }
        settingNode.getChildByName("Icon")
            .getChildByName("Icon")
            .getComponent(Sprite).spriteFrame = container.icon
    }

    // 关闭详情
    protected closeDetail = () => {
        this.node.active = false
        if (this.closeCallback) this.closeCallback()
    }

}


