import { _decorator, Button, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { skillManager } from 'db://assets/Script/Game/Manager/SkillManager';
import { createPlayerInstance } from 'db://assets/Script/Game/Share';
import { getSkillUpLevelMaterial } from 'db://assets/Script/Game/System/SkillConfig';
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
        const canvasNode = find('Canvas')
        const skillContainerNode = this.node.getChildByName("SkillPanel")
        // 清空技能节点
        skillContainerNode.removeAllChildren()
        // 渲染技能
        skillManager.data.skills.forEach(async (proto, i) => {
            const instance = new SkillInstance({
                lv: skillManager.data.getSkillLevel(proto),
                Proto: getSkillPrototype(proto),
            })
            const skillItemNode = instantiate(this.SkillItemTempNode)
            // 图标
            const icon = await instance.proto.icon()
            // 动态渲染effect
            const effects: ReactiveEffectRunner[] = []
            this.setSkillItemTempNode(
                skillItemNode , skillManager.data.getSkillLevel(proto) , icon, async () => {
                    const detailNode = CcNative.instantiate(this.DetailInfoPrefab)
                    const detailPrefab = detailNode.getComponent(DetailInfoPrefab)
                    // 动态渲染详情界面
                    const effect = this.effect(() => {
                        const buttons = [
                            {
                                label: LanguageManager.getEntry("Unload").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.unloadSkill(proto)
                                    close()
                                }
                            },
                            skillManager.data.getSkillLevel(proto) < 10 ? {
                                label: LanguageManager.getEntry("Levelup").getValue(settingManager.data.language),
                                callback: (close: Function) => {
                                    skillManager.data.upgradeSkill(proto)
                                }
                            } : null,
                        ]
                        const material = getSkillUpLevelMaterial(proto , skillManager.data.getSkillLevel(proto))
                        const instance = new SkillInstance({
                            lv: skillManager.data.getSkillLevel(proto),
                            Proto: getSkillPrototype(proto),
                        })
                        detailPrefab.setDetail({
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
                                buttons,
                            }],
                            closeCallback: () => {
                                effects.forEach(e => e.effect.stop())
                                effects.length = 0
                                canvasNode.removeChild(detailNode)
                            }
                        })
                    })
                    effects.push(effect)
                    canvasNode.addChild(detailNode)
                }
            )
            // 添加技能节点
            skillContainerNode.addChild(skillItemNode)
            skillItemNode.setPosition(posx[i], -15)
        })
        return
    }

    // 初始化未携带的技能
    protected initSkillList() {
        const skillContainerNode = this.node.getChildByName("AllSkillPanel")
            .getChildByName("Mask").getChildByName("Container")
        
    }

    // 关闭界面
    protected closeSkillPanel() {
        this.node.active = false
    }

}