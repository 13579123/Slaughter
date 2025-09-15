import { _decorator, Button, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { skillManager } from '../../Script/Game/Manager/SkillManager';
import { CcNative } from '../../Script/Module/CcNative';
import { SkillInstance } from '../../Script/System/Core/Instance/SkillInstance';
import { getSkillPrototype } from '../../Script/System/Manager/SkillManager';
import { createPlayerInstance } from '../../Script/Game/Share';
import { DetailInfoPrefab } from './DetailInfoPrefab';
import { backpackManager } from '../../Script/Game/Manager/BackpackManager';
import { settingManager } from '../../Script/Game/Manager/SettingManager';
import { LanguageManager } from '../../Script/Module/Language/LanguageManager';
const { ccclass, property } = _decorator;

@ccclass('SkillPrefab')
export class SkillPrefab extends ExtensionComponent {

    // 详细信息预制体
    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null

    // 技能item模板
    protected SkillItemTempNode: Node = null

    protected start(): void {
        this.SkillItemTempNode = this.node.getChildByName("SkillPanel").children[0]
        this.node.getChildByName("SkillPanel").removeChild(this.SkillItemTempNode)
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
        skillManager.data.skills.forEach(async (skillDTO, i) => {
            const instance = new SkillInstance({
                lv: skillDTO.lv,
                characterInstance: createPlayerInstance(),
                Proto: getSkillPrototype(skillDTO.prototype),
            })
            const skillItemNode = instantiate(this.SkillItemTempNode)
            const buttons = []
            // buttons.push({
            //     label: LanguageManager.getEntry("Use").getValue(settingManager.data.language),
            //     callback: (close) => {

            //         close()
            //     },
            // })
            this.setSkillItemTempNode(
                skillItemNode,
                skillDTO.lv,
                await instance.proto.icon(),
                async () => {
                    const detailNode = CcNative.instantiate(this.DetailInfoPrefab)
                    detailNode.getComponent(DetailInfoPrefab).setDetail({
                        content: [{
                            title: instance.proto.name,
                            icon: await instance.proto.icon(),
                            rightMessage: "Lv: " + instance.lv + "\n\n" + instance.proto.description,
                            buttons,
                        }],
                        closeCallback: () => canvasNode.removeChild(detailNode)
                    })
                    canvasNode.addChild(detailNode)
                }
            )
            skillContainerNode.addChild(skillItemNode)
            skillItemNode.setPosition(posx[i], -15)
        })
        return
    }

    // 关闭界面
    protected closeSkillPanel() {
        this.node.active = false
    }

}