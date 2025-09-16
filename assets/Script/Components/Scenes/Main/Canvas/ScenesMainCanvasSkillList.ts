import { _decorator, Button, Component, EventTouch, find, instantiate, Label, Node, NodeEventType, Prefab, Sprite, SpriteFrame } from 'cc';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { characterManager } from 'db://assets/Script/Game/Manager/CharacterManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { skillManager } from 'db://assets/Script/Game/Manager/SkillManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { createPlayerInstance } from 'db://assets/Script/Game/Share';
import { getPlayerSkillRootNode, getSkillUpLevelMaterial } from 'db://assets/Script/Game/System/SkillConfig';
import { CcNative } from 'db://assets/Script/Module/CcNative';
import ExtensionComponent from 'db://assets/Script/Module/Extension/Component/ExtensionComponent';
import { LanguageManager } from 'db://assets/Script/Module/Language/LanguageManager';
import { ReactiveEffect, ReactiveEffectRunner } from 'db://assets/Script/Module/Rx/reactivity';
import { SkillInstance } from 'db://assets/Script/System/Core/Instance/SkillInstance';
import { getSkillKey, getSkillPrototype } from 'db://assets/Script/System/Manager/SkillManager';
const { ccclass, property } = _decorator;


@ccclass('ScenesMainCanvasSkillList')
export class ScenesMainCanvasSkillList extends ExtensionComponent {

    // 详细信息预制体
    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null

    // 技能item模板
    protected SkillItemTempNode: Node = null

    protected onLoad(): void {
        // 获取模板节点
        this.SkillItemTempNode = this.node.getChildByName("SkillPanel").children[0]
        this.node.getChildByName("SkillPanel").removeChild(this.SkillItemTempNode)
        // 初始化技能列表
        this.effect(() => this.initEquipSkill())
        // 初始化未携带的技能列表
        this.effect(() => this.initSkillList())
    }

    // 设置模板节点
    protected setSkillItemTempNode(node: Node, lv: number, icon: SpriteFrame, callback: Function) {
        node.getChildByName("Icon").getComponent(Sprite).spriteFrame = icon
        node.getChildByName("Level").getComponent(Label).string = "Lv: " + lv
        node.on(Button.EventType.CLICK, () => callback())
    }

    // 初始化携带的技能
    protected initEquipSkill() {
        const posx = [-175, 0, 175]
        const skillContainerNode = this.node.getChildByName("SkillPanel")
        // 清空技能节点
        skillContainerNode.removeAllChildren()
        // 渲染技能
        skillManager.data.skills.forEach(async (proto, i) => {
            // 创建技能节点
            const skillItemNode = await this.createdSkillItemNode(proto , [
                skillManager.data.getSkillLevel(proto) <= 10 ? "uplevel" : "",
                "unload"
            ])
            // 添加技能节点
            skillContainerNode.addChild(skillItemNode)
            // 设置坐标
            skillItemNode.setPosition(posx[i], -15)
        })
        return
    }

    // 初始化未携带的技能
    protected initSkillList() {
        const maskNode = this.node.getChildByName("AllSkillPanel")
            .getChildByName("Mask")
        const skillContainerNode = this.node.getChildByName("AllSkillPanel")
            .getChildByName("Mask").getChildByName("Container")
        let touching = false
        maskNode.on(NodeEventType.TOUCH_START , (e: EventTouch) => touching = true)
        maskNode.on(NodeEventType.TOUCH_END , (e: EventTouch) => touching = false)
        maskNode.on(NodeEventType.TOUCH_CANCEL , (e: EventTouch) => touching = false)
        maskNode.on(NodeEventType.TOUCH_MOVE , (e: EventTouch) => {
            if (!touching) return
            skillContainerNode.setPosition(skillContainerNode.x + e.getDelta().x, skillContainerNode.y + e.getDelta().y)
        })
        // 清空技能节点
        skillContainerNode.removeAllChildren()
        // 获取技能树根节点
        const root = getPlayerSkillRootNode(characterManager.data.currentCharacter)
        if (!root) return message.toast("获取技能树根节点失败")
        // 渲染技能

    }

    // 创建技能节点
    protected async createdSkillItemNode(prototype: string, btns: ("uplevel"|"unload"|"eqiupment"|"learn"|"")[]): Promise<Node> {
        const canvasNode = find('Canvas')
        const resultNode = instantiate(this.SkillItemTempNode)
        const instance = new SkillInstance({
            lv: skillManager.data.getSkillLevel(prototype),
            Proto: getSkillPrototype(prototype)
        })
        const icon = await instance.proto.icon()
        // 点击图标回调
        const clickCallback = () => {
            // 详细节点
            const detailNode = CcNative.instantiate(this.DetailInfoPrefab)
            const detailPrefab = detailNode.getComponent(DetailInfoPrefab)
            const effect = this.effect(() => {
                const material = getSkillUpLevelMaterial(prototype, skillManager.data.getSkillLevel(prototype))
                // 实时创建技能实例跟随界面更新
                const instance = new SkillInstance({
                    lv: skillManager.data.getSkillLevel(prototype),
                    characterInstance: createPlayerInstance(),
                    Proto: getSkillPrototype(prototype)
                })
                detailPrefab.setDetail({
                    // 界面内容
                    content: [{
                        title: instance.proto.name,
                        icon: icon,
                        rightMessage:
                            "Lv: " + instance.lv +
                            "\n\n" +
                            instance.proto.description +
                            "\n\n\n" +
                            LanguageManager.getEntry("LevelUp").getValue(settingManager.data.language) +
                            LanguageManager.getEntry("Material").getValue(settingManager.data.language) +
                            "\n\n" +
                            LanguageManager.getEntry("Gold").getValue(settingManager.data.language) +
                            ":" +
                            material.gold +
                            "\n" +
                            LanguageManager.getEntry("Diamond").getValue(settingManager.data.language) +
                            ":" +
                            material.diamond,
                        // 按钮列表
                        buttons: [
                            (btns.indexOf("unload") !== -1) ?{
                                label: LanguageManager.getEntry("Unload").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.unloadSkill(prototype)
                                    close()
                                }
                            } : null ,
                            (btns.indexOf("eqiupment") !== -1) ?{
                                label: LanguageManager.getEntry("Eqiupment").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.equipSkill(prototype)
                                    close()
                                }
                            } : null ,
                            (btns.indexOf("uplevel") !== -1) ? {
                                label: LanguageManager.getEntry("Levelup").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.upgradeSkill(prototype)
                                }
                            } : null,
                            (btns.indexOf("learn") !== -1) ? {
                                label: LanguageManager.getEntry("Learn").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.learnSkill(prototype)
                                }
                            } : null,
                        ],
                    }],
                    // 关闭回调
                    closeCallback: () => {
                        canvasNode.removeChild(detailNode);
                        effect.effect.stop()
                    }
                })
            })
            canvasNode.addChild(detailNode)
        }
        // 设置技能节点
        this.setSkillItemTempNode(
            resultNode,
            skillManager.data.getSkillLevel(prototype),
            icon,
            clickCallback
        )
        return resultNode
    }

    // 关闭界面
    protected closeSkillPanel() { this.node.active = false }

}