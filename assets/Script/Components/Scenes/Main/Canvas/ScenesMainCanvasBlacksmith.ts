import { _decorator, Color, Component, EventTouch, Label, Node, Prefab, RichText, ScrollView, Sprite } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { Rx } from 'db://assets/Module/Rx';
import { EquipmentItemPrefab } from 'db://assets/Prefabs/Components/EquipmentItemPrefab';
import { backpackManager } from 'db://assets/Script/Game/Manager/BackpackManager';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { resourceManager } from 'db://assets/Script/Game/Manager/ResourceManager';
import { EquipmentInstance } from 'db://assets/Script/System/Core/Instance/EquipmentInstance';
import { ItemInstance } from 'db://assets/Script/System/Core/Instance/ItemInstance';
import { EquipmentDTO } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { getEquipmentKey, getEquipmentPrototype, getStrongMaterial } from 'db://assets/Script/System/Manager/EquipmentManager';
import { getItemPrototype } from 'db://assets/Script/System/Manager/ItemManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasBlacksmith')
export class ScenesMainCanvasBlacksmith extends ExtensionComponent {

    @property(Prefab)
    protected EquipmentItemPrefab: Prefab = null;

    protected showType = Rx.ref(0)

    protected strengthenData = Rx.reactive<{
        selectEquip: EquipmentDTO,  // 选择的装备
    }>({
        selectEquip: null,
    })

    protected decomposeData = Rx.reactive<{
        selectEquipList: EquipmentDTO[],  // 选择的装备
    }>({
        selectEquipList: [],
    })

    protected start() {
        // 按钮发光
        const uiNode = this.node.getChildByName("Ui")
        this.effect(() => {
            uiNode.children.forEach(
                child => child.getComponent(Sprite).color = new Color(200, 200, 200)
            )
            uiNode.children[this.showType.value].getComponent(Sprite).color = new Color(255, 255, 255)
        })
        // 展示内容
        const blacksmithNode = this.node.getChildByName("Blackmith")
        this.effect(() => {
            blacksmithNode.children.forEach(child => child.active = false)
            blacksmithNode.children[this.showType.value].active = true
        })
        // 初始化强化
        this.initStrengthen()
        return
    }

    protected showTypeChange(e: EventTouch, type: string) {
        this.showType.value = parseInt(type)
        if (this.showType.value === 0) {
            this.initStrengthen()
        }
    }

    // 强化装备
    protected strengthenEquipment() {
        if (this.strengthenData.selectEquip) {
            equipmentManager.data.strengthenEquipment(
                this.strengthenData.selectEquip.id,
                resourceManager,
                backpackManager
            )
            equipmentManager.save()
            resourceManager.save()
            backpackManager.save()
            this.initStrengthen()
        }
    }

    // 分解装备
    protected decomposeEquipment() {
        this.decomposeData.selectEquipList.forEach(e => {
            equipmentManager.data.decompose(e.id , resourceManager , backpackManager)
            resourceManager.save()
            backpackManager.save()
            equipmentManager.save()
        })
        this.initDecompose()
    }

    // 初始化强化
    protected initStrengthen() {
        this.renderStrengthenEquipment()
        this.renderStrengthenAllEquipment()
        return
    }

    // 渲染强化装备
    protected renderStrengthenEquipment() {
        const strengthenNode = this.node.getChildByName("Blackmith").getChildByName("Strengthen")
        const equipmentPrefab = strengthenNode.getChildByName("SelectedEquipmentIcon").getComponent(EquipmentItemPrefab)
        const nameLabel = strengthenNode.getChildByName("SelectedEquipmentName").getComponent(Label)
        const needGoldLabel = strengthenNode.getChildByName("NeedGold").getChildByName("Label").getComponent(Label)
        const needDiamondLabel = strengthenNode.getChildByName("NeedDiamond").getChildByName("Label").getComponent(Label)
        const propertyDescription = strengthenNode.getChildByName("SelectedEquipmentPropertyDescription")
            .getComponent(RichText)
        const nextLevelPropertyDescription = strengthenNode.getChildByName("SelectedEquipmentNextLevelPropertyDescription")
            .getComponent(RichText)
        if (!this.strengthenData.selectEquip) {
            equipmentPrefab.setInfo(null)
            needGoldLabel.string = needDiamondLabel.string = "0"
            nameLabel.string = propertyDescription.string = nextLevelPropertyDescription.string = ""
        } else if (this.strengthenData.selectEquip) {
            const instance = new EquipmentInstance({
                id: this.strengthenData.selectEquip.id,
                lv: this.strengthenData.selectEquip.lv,
                quality: this.strengthenData.selectEquip.quality,
                Proto: getEquipmentPrototype(this.strengthenData.selectEquip.prototype),
            })
            equipmentPrefab.setInfo(
                instance, () => {
                    this.strengthenData.selectEquip = null
                    this.renderStrengthenEquipment()
                    this.renderStrengthenAllEquipment()
                }
            )
            nameLabel.string = instance.proto.name
            propertyDescription.string = instance.proto.propertyDescription.split("\n\n")[0]
            if (instance.lv >= 10) {
                nextLevelPropertyDescription.string = "已满级"
            } else {
                const nextEquip = new EquipmentInstance({
                    extraProperty: {},
                    id: this.strengthenData.selectEquip.id,
                    lv: instance.lv + 1,
                    quality: instance.quality,
                    Proto: instance.proto.constructor as any,
                })
                nextLevelPropertyDescription.string = nextEquip.proto.propertyDescription.split("\n\n")[0]
            }
            const needMaterial = getStrongMaterial(
                getEquipmentKey(instance.proto),
                instance.lv
            )
            if (!needMaterial) needGoldLabel.string = needDiamondLabel.string = "0"
            else {
                needGoldLabel.string = needMaterial.gold + ""
                needDiamondLabel.string = needMaterial.diamond + ""
                // 渲染材料
                const materialContent = strengthenNode.getChildByName("NeedItems").getComponent(ScrollView).content
                const children = Array.from(materialContent.children)
                materialContent.removeAllChildren()
                children.forEach(child => child.destroy())
                // 渲染需要的item
                needMaterial.items.forEach(item => {
                    const node = CcNative.instantiate(this.EquipmentItemPrefab)
                    node.setScale(0.7 , 0.7)
                    node.getComponent(EquipmentItemPrefab).setInfo(new ItemInstance({
                        Proto: getItemPrototype(item.prototype),
                        count: item.count,
                    }))
                    materialContent.addChild(node)
                })
            }
        }
        return
    }

    // 渲染强化装备
    protected renderStrengthenAllEquipment() {
        const strengthenNode = this.node.getChildByName("Blackmith").getChildByName("Strengthen")
        // 渲染所有装备
        const content = strengthenNode.getChildByName("AllEquipment").getChildByName("View").getChildByName("Content")
        const children = Array.from(content.children)
        content.removeAllChildren()
        children.forEach(child => child.destroy())
        const equipments: EquipmentDTO[] = [
            equipmentManager.data.equipment.weapon,
            equipmentManager.data.equipment.armor,
            equipmentManager.data.equipment.accessory,
            equipmentManager.data.equipment.shoes,
        ]
        const nodes = []
        equipmentManager.data.equipments.forEach(e => equipments.push(e))
        for (let i = 0; i < equipments.length; i++) {
            const equipment = equipments[i];
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            nodes.push(node)
            node.getComponent(EquipmentItemPrefab).setInfo(new EquipmentInstance({
                id: equipment.id,
                lv: equipment.lv,
                quality: equipment.quality,
                Proto: getEquipmentPrototype(equipment.prototype),
            }), () => {
                if (this.strengthenData.selectEquip?.id === equipment.id) {
                    nodes.forEach(node => node.getComponent(Sprite).color = new Color(255, 255, 255))
                    this.strengthenData.selectEquip = null
                    node.getComponent(Sprite).color = new Color(255, 255, 255)
                    this.renderStrengthenEquipment()
                } else {
                    nodes.forEach(node => node.getComponent(Sprite).color = new Color(255, 255, 255))
                    this.strengthenData.selectEquip = equipment
                    node.getComponent(Sprite).color = new Color(180, 180, 180)
                    this.renderStrengthenEquipment()
                }
            })
            if (this.strengthenData.selectEquip?.id === equipment.id) {
                node.getComponent(Sprite).color = new Color(180, 180, 180)
            }
            content.addChild(node)
        }
    }

    // 初始化分解
    protected initDecompose() {

    }

}


