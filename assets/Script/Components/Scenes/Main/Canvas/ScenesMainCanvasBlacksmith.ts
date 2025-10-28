import { _decorator, Color, Component, EventTouch, Label, Node, Prefab, RichText, ScrollView, Sprite } from 'cc';
import { Diamond } from 'db://assets/Mod/Base/Prototype/Item/Diamond';
import { Gold } from 'db://assets/Mod/Base/Prototype/Item/Gold';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { Rx } from 'db://assets/Module/Rx';
import { EquipmentItemPrefab } from 'db://assets/Prefabs/Components/EquipmentItemPrefab';
import { backpackManager } from 'db://assets/Script/Game/Manager/BackpackManager';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { resourceManager } from 'db://assets/Script/Game/Manager/ResourceManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { EquipmentInstance } from 'db://assets/Script/System/Core/Instance/EquipmentInstance';
import { ItemInstance } from 'db://assets/Script/System/Core/Instance/ItemInstance';
import { EquipmentDTO } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { ItemDTO } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { getDecomposeMaterial, getEquipmentKey, getEquipmentPrototype, getStrongMaterial } from 'db://assets/Script/System/Manager/EquipmentManager';
import { getItemKey, getItemPrototype } from 'db://assets/Script/System/Manager/ItemManager';
import { ScenesMainCanvasSound } from './ScenesMainCanvasSound';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasBlacksmith')
export class ScenesMainCanvasBlacksmith extends ExtensionComponent {

    @property(ScenesMainCanvasSound)
    protected SoundController: ScenesMainCanvasSound = null;

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

    // 展示类型切换
    protected showTypeChange(e: EventTouch, type: string) {
        this.showType.value = parseInt(type)
        if (this.showType.value === 0) {
            this.initStrengthen()
        } else if (this.showType.value === 1) {
            this.initDecompose()
        }
    }

    // 关闭
    protected close() {
        this.node.active = false
    }

    // 强化装备
    protected strengthenEquipment() {
        if (this.strengthenData.selectEquip) {
            const success = equipmentManager.data.strengthenEquipment(
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
        if (this.decomposeData.selectEquipList.length <= 0) {
            return message.toast((new class extends LanguageEntry {
                public get chs(): string {
                    return "请选择要分解的装备"
                }
                public get eng(): string {
                    return "Please select the equipment to decompose"
                }
                public get jpn(): string {
                    return "分解する装備を選択してください"
                }
            }).getValue(settingManager.data.language))
        }
        equipmentManager.data.decompose(
            this.decomposeData.selectEquipList.map(e => e.id),
            resourceManager,
            backpackManager
        )
        resourceManager.save()
        backpackManager.save()
        equipmentManager.save()
        this.initDecompose()
        this.SoundController.playGetAwardSound()
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
            const materialContent = strengthenNode.getChildByName("NeedItems").getComponent(ScrollView).content
            // 渲染材料
            const children = Array.from(materialContent.children)
            materialContent.removeAllChildren()
            children.forEach(child => child.destroy())
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
            const materialContent = strengthenNode.getChildByName("NeedItems").getComponent(ScrollView).content
            if (!needMaterial) {
                needGoldLabel.string = needDiamondLabel.string = "0"
                // 渲染材料
                const children = Array.from(materialContent.children)
                materialContent.removeAllChildren()
                children.forEach(child => child.destroy())
            }
            else {
                needGoldLabel.string = needMaterial.gold + ""
                needDiamondLabel.string = needMaterial.diamond + ""
                // 渲染材料
                const children = Array.from(materialContent.children)
                materialContent.removeAllChildren()
                children.forEach(child => child.destroy())
                // 渲染需要的item
                needMaterial.items.forEach(item => {
                    const node = CcNative.instantiate(this.EquipmentItemPrefab)
                    node.setScale(0.7, 0.7)
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

    // 所有强化装备列表的复制，用来避免重复渲染
    protected allStrengthenEquipmentNodeMap: Map<string, { json: string, node: Node }> = new Map()

    // 渲染所有装备
    protected renderStrengthenAllEquipment() {
        const strengthenNode = this.node.getChildByName("Blackmith").getChildByName("Strengthen")
        // 渲染所有装备
        const content = strengthenNode.getChildByName("AllEquipment").getChildByName("View").getChildByName("Content")
        content.removeAllChildren()
        const equipments: EquipmentDTO[] = [
            equipmentManager.data.equipment.weapon,
            equipmentManager.data.equipment.armor,
            equipmentManager.data.equipment.accessory,
            equipmentManager.data.equipment.shoes,
        ]
        const nodes = []
        equipmentManager.data.equipments.forEach(e => equipments.push(e))
        const setEquipment = (node: Node, equipment: EquipmentDTO) => {
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
        }
        for (let i = 0; i < equipments.length; i++) {
            const equipment = equipments[i];
            if (!equipment) continue
            let node = null
            if (this.allStrengthenEquipmentNodeMap.has(equipment.id)) {
                const data = this.allStrengthenEquipmentNodeMap.get(equipment.id)
                node = data.node
                if (data.json !== JSON.stringify(equipment)) {
                    setEquipment(node, equipment)
                    data.json = JSON.stringify(equipment)
                }
            } else {
                node = CcNative.instantiate(this.EquipmentItemPrefab)
                setEquipment(node, equipment)
                this.allStrengthenEquipmentNodeMap.set(equipment.id, { node, json: JSON.stringify(equipment) })
            }
            nodes.push(node)
            content.addChild(node)
        }
    }

    // 初始化分解
    protected initDecompose() {
        this.decomposeData.selectEquipList = []
        this.renderDecomposeAllEquipment()
        this.renderDecomposeSelectedEquipment()
        return
    }

    protected renderDecomposeSelectedEquipment() {
        const decompositionNode = this.node.getChildByName("Blackmith").getChildByName("Decomposition")
        const contentNode = decompositionNode.getChildByName("RetrunMaterial").getComponent(ScrollView).content
        const children = Array.from(contentNode.children)
        contentNode.removeAllChildren()
        children.forEach(child => child.destroy())
        const material: { [key: string]: number } = {}
        this.decomposeData.selectEquipList.forEach(equipment => {
            const decomposeMaterial = getDecomposeMaterial(equipment.prototype, equipment.lv)
            if (!decomposeMaterial) return
            const goldKey = getItemKey(Gold), diamondKey = getItemKey(Diamond)
            if (decomposeMaterial.gold) {
                if (!material[goldKey]) material[goldKey] = decomposeMaterial.gold
                else material[goldKey] += decomposeMaterial.gold || 0
            }
            if (decomposeMaterial.diamond) {
                if (!material[diamondKey]) material[diamondKey] = decomposeMaterial.diamond
                else material[diamondKey] += decomposeMaterial.diamond || 0
            }
            decomposeMaterial?.items.forEach(item => {
                if (material[item.prototype]) material[item.prototype] += item.count
                else material[item.prototype] = item.count
            })
        })
        Object.keys(material).forEach(key => {
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            node.getComponent(EquipmentItemPrefab).setInfo(new ItemInstance({
                Proto: getItemPrototype(key),
                count: material[key],
            }))
            contentNode.addChild(node)
        })
        return
    }

    protected renderDecomposeAllEquipment() {
        const decompositionNode = this.node.getChildByName("Blackmith").getChildByName("Decomposition")
        const contentNode = decompositionNode.getChildByName("AllEquipments").getComponent(ScrollView).content
        contentNode.removeAllChildren()
        equipmentManager.data.equipments.forEach(equipment => {
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            node.getComponent(EquipmentItemPrefab).setInfo(new EquipmentInstance({
                id: equipment.id,
                lv: equipment.lv,
                quality: equipment.quality,
                Proto: getEquipmentPrototype(equipment.prototype),
            }), () => {
                // 如果没有选中
                const index = this.decomposeData.selectEquipList.indexOf(equipment)
                if (index === -1) {
                    this.decomposeData.selectEquipList.push(equipment)
                    node.getComponent(Sprite).color = new Color(150, 150, 150)
                    this.renderDecomposeSelectedEquipment()
                }
                else {
                    this.decomposeData.selectEquipList.splice(index, 1)
                    node.getComponent(Sprite).color = new Color(255, 255, 255)
                    this.renderDecomposeSelectedEquipment()
                }
            })
            contentNode.addChild(node)
        })
        return
    }

}


