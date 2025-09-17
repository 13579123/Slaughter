import { _decorator, Button, Color, Component, EventTouch, find, Graphics, instantiate, Label, Node, NodeEventType, Prefab, Sprite, SpriteFrame } from 'cc';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { characterManager } from 'db://assets/Script/Game/Manager/CharacterManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { skillManager } from 'db://assets/Script/Game/Manager/SkillManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { createPlayerInstance } from 'db://assets/Script/Game/Share';
import { getPlayerSkillRootsNode, getPlayerSkillTreeFloor, getSkillUpLevelMaterial, SkillNode } from 'db://assets/Script/Game/System/SkillConfig';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { LanguageManager } from 'db://assets/Module/Language/LanguageManager';
import { ReactiveEffect, ReactiveEffectRunner } from 'db://assets/Module/Rx/reactivity';
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

    @property(Graphics)
    protected SkillTreeGraphics: Graphics = null;

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
        node.getChildByName("Level").getComponent(Label).string = lv > 0 ? ("Lv: " + lv) : ""
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
                skillManager.data.getSkillLevel(proto) < 10 ? "uplevel" : "",
                "unload"
            ])
            // 添加技能节点
            skillContainerNode.addChild(skillItemNode)
            // 设置坐标
            skillItemNode.setPosition(posx[i], -15)
        })
        return
    }

    // 移除触摸事件
    protected removeTouchEvent: Function = null

    // 初始化未携带的技能
    protected initSkillList() {
        const maskNode = this.node.getChildByName("AllSkillPanel").getChildByName("Mask")
        const skillContainerNode = this.node.getChildByName("AllSkillPanel")
            .getChildByName("Mask").getChildByName("Container")
        // 移除触摸事件
        if( this.removeTouchEvent ) this.removeTouchEvent()
        // 清空技能节点
        skillContainerNode.removeAllChildren()
        // 获取技能树根节点
        const roots = getPlayerSkillRootsNode(characterManager.data.currentCharacter)
        if (!roots) return message.toast("获取技能树根节点失败")
        // 技能树对应的结构
        const skillTreeToMatrix: Array<Array<SkillNode>> = []
        const skillTreeSkewPostion: Map<SkillNode, { x: number, y: number }> = new Map()
        // 生成技能树
        let currentLine = 0
        const convertToMatrix = (skillNode: SkillNode, add: number = 0) => {
            if (skillTreeToMatrix[skillNode.floor] == null) skillTreeToMatrix[skillNode.floor] = []
            skillTreeToMatrix[skillNode.floor][currentLine] = skillNode
            if (skillNode.children.length > 0) {
                skillNode.children.forEach(child => convertToMatrix(child, 1))
            } else {
                currentLine += add
            }
        }
        roots.forEach(r => convertToMatrix(r, 1))
        // 生成技能节点坐标
        skillTreeToMatrix.forEach((list, y) => {
            list?.forEach((skillNode, x) => {
                skillTreeSkewPostion.set(skillNode, { x: -180 + x * 190, y: 180 - y * 190 })
            })
        })
        // 开始坐标对齐
        const aligningPosition = (root: SkillNode) => {
            root.children.forEach(c => aligningPosition(c))
            if (root.children.length <= 1) return
            if (root.children.length % 2 === 0) {
                const diIndex = root.children.length / 2 - 1
                const gaoIndex = root.children.length / 2
                const diNodeX = skillTreeSkewPostion.get(root.children[diIndex]).x
                const gaoNodeX = skillTreeSkewPostion.get(root.children[gaoIndex]).x
                skillTreeSkewPostion.get( root ).x = diNodeX + (gaoNodeX - diNodeX) / 2
            } else {
                const index = Math.floor(root.children.length / 2)
                skillTreeSkewPostion.get( root ).x = skillTreeSkewPostion.get(root.children[index]).x
            }
        }
        roots.forEach(r => aligningPosition(r))
        // 画线
        const drowLine = (root: SkillNode, parent: SkillNode = null) => {
            if (parent === null) {
                root.children.forEach(c => drowLine(c , root))
                return
            }
            const point1 = skillTreeSkewPostion.get(root) , point2 = skillTreeSkewPostion.get(parent)
            this.SkillTreeGraphics.lineWidth = 10
            this.SkillTreeGraphics.moveTo(point1.x , point1.y)
            this.SkillTreeGraphics.lineTo(point2.x , point2.y)
            this.SkillTreeGraphics.close()
            this.SkillTreeGraphics.stroke();
            this.SkillTreeGraphics.fill();
            root.children.forEach(c => drowLine(c , root))
        }
        roots.forEach((r) => drowLine(r))
        // 绘制技能节点
        const renderSkill = async (skillNode: SkillNode) => {
            skillNode.children.forEach(node => renderSkill(node))
            // 获取技能覆盖情况
            const getMaskType = (node: SkillNode) => {
                if (node.parent) {
                    if (skillManager.data.getSkillLevel(node.parent.key) === 0) return "unlearn"
                    if (skillManager.data.getSkillLevel(node.key) === 0) return "learn"
                }
                if (skillManager.data.getSkillLevel(node.key) === 0) return "learn"
                return "none"
            }
            // 坐标
            const pos = skillTreeSkewPostion.get(skillNode)
            // 创建技能节点
            const skillItemNode = await this.createdSkillItemNode(skillNode.key , [
                skillManager.data.skills.indexOf(skillNode.key) !== -1 ? 
                "unload" : "",
                skillManager.data.getSkillLevel(skillNode.key) > 0 
                &&
                skillManager.data.skills.indexOf(skillNode.key) === -1? 
                "eqiupment" : "",
                skillManager.data.getSkillLevel(skillNode.key) > 0
                && 
                skillManager.data.getSkillLevel(skillNode.key) < 10 ?
                "uplevel" : "",
                skillManager.data.getSkillLevel(skillNode.key) === 0
                &&
                skillNode.parent
                &&
                skillManager.data.getSkillLevel(skillNode.parent.key) > 0 ?
                "learn" : "",
                skillManager.data.getSkillLevel(skillNode.key) === 0
                &&
                !skillNode.parent ?
                "learn" : "",
            ] , getMaskType(skillNode) as any)
            skillContainerNode.addChild(skillItemNode)
            skillItemNode.setPosition(pos.x , pos.y)
        }
        roots.forEach((r) => renderSkill(r))
        // 获取最大技能宽高
        const floors = getPlayerSkillTreeFloor(characterManager.data.currentCharacter)
        let maxWidth = 0 , maxHeight = floors.length
        floors.forEach(floor => { maxWidth = Math.max(maxWidth , floor) })
        // 触摸回调
        let touching = false
        const movePos = { x : 0 , y : 0 }
        const c1 = (e: EventTouch) => touching = true
        const c2 = (e: EventTouch) => touching = false
        const c3 = (e: EventTouch) => {
            if (!touching) return
            const pos = e.getDelta()
            movePos.x += pos.x
            movePos.y += pos.y
            if (movePos.x > 0) movePos.x = 0
            if (movePos.y < 0) movePos.y = 0
            if (movePos.x < -maxWidth * 190 + 560) movePos.x = -maxWidth * 190 + 560
            if (movePos.y > maxHeight * 190 - 300) movePos.y = maxHeight * 190 - 300
            skillContainerNode.setPosition( movePos.x , movePos.y )
        }
        maskNode.on(NodeEventType.TOUCH_START , c1)
        maskNode.on(NodeEventType.TOUCH_END , c2)
        maskNode.on(NodeEventType.TOUCH_CANCEL , c2)
        maskNode.on(NodeEventType.TOUCH_MOVE , c3)
        this.removeTouchEvent = () => {
            maskNode.off(NodeEventType.TOUCH_START , c1)
            maskNode.off(NodeEventType.TOUCH_END , c2)
            maskNode.off(NodeEventType.TOUCH_CANCEL , c2)
            maskNode.off(NodeEventType.TOUCH_MOVE , c3)
        }
        return
    }

    // 创建技能节点
    protected async createdSkillItemNode(
        prototype: string, 
        btns: ("uplevel"|"unload"|"eqiupment"|"learn"|"")[] , 
        maskType: "learn"|"unLearn"|"none" = "none"): Promise<Node> {
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
                            (instance.lv > 0 ? ("Lv: " + instance.lv + "\n\n") : "") +
                            instance.proto.description +
                            "\n\n\n" +
                            (btns.indexOf("learn") !== -1 ?
                            LanguageManager.getEntry("LevelUp").getValue(settingManager.data.language) :
                            LanguageManager.getEntry("Learn").getValue(settingManager.data.language)) +
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
                                label: LanguageManager.getEntry("Equipment").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.equipSkill(prototype)
                                    close()
                                }
                            } : null ,
                            (btns.indexOf("uplevel") !== -1) ? {
                                label: LanguageManager.getEntry("Levelup").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.upgradeSkill(prototype)
                                    if (skillManager.data.getSkillLevel(prototype) >= 10) {
                                        close()
                                    }
                                }
                            } : null,
                            (btns.indexOf("learn") !== -1) ? {
                                label: LanguageManager.getEntry("Learn").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.learnSkill(prototype)
                                    close()
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
        // 设置技能节点mask
        const maskNode = resultNode.getChildByName("Mask")
        if (maskType === "learn") {
            maskNode.active = true
            maskNode.getComponent(Sprite).color = new Color(0,0,0,80)
        } else if (maskType === "unLearn") {
            maskNode.active = true
            maskNode.addComponent(Button)
            maskNode.getComponent(Sprite).color = new Color(0,0,0,255)
        } else if (maskType === "none") {
            maskNode.active = false
        }
        return resultNode
    }

    // 关闭界面
    protected closeSkillPanel() { this.node.active = false }

}