import { _decorator, Color, Component, find, Node, Prefab, ScrollView, Sprite, SpriteFrame } from 'cc';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { equipmentManager } from '../../Script/Game/Manager/EquipmentManager';
import { EquipmentItemPrefab } from './EquipmentItemPrefab';
import { createPlayerInstance } from '../../Script/Game/Share';
import { CcNative } from '../../Script/Module/CcNative';
import { DetailInfoPrefab } from './DetailInfoPrefab';
import { EquipmentInstance } from '../../Script/System/Core/Instance/EquipmentInstance';
import { LanguageManager } from '../../Script/Module/Language/LanguageManager';
import { settingManager } from '../../Script/Game/Manager/SettingManager';
import { getEquipmentPrototype } from '../../Script/System/Manager/EquipmentManager';
import { EquipmentDTO } from '../../Script/System/Core/Prototype/EquipmentPrototype';
import { Ref } from '../../Script/Module/Rx/reactivity';
import { Rx } from '../../Script/Module/Rx';
import { backpackManager } from '../../Script/Game/Manager/BackpackManager';
import { ItemInstance } from '../../Script/System/Core/Instance/ItemInstance';
import { getItemKey, getItemPrototype } from '../../Script/System/Manager/ItemManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasBackpack')
export class ScenesMainCanvasBackpack extends ExtensionComponent {

    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null

    @property(Prefab)
    protected EquipmentItemPrefab: Prefab = null

    // 修改展示数据
    public showDataType = Rx.ref("item")

    // 开始生命周期
    protected start(): void {
        const itemBtn = this.node.getChildByName("Ui").getChildByName("Item")
        const equipmentBtn = this.node.getChildByName("Ui").getChildByName("Equipment")
        this.effect(() => this.initHasEquipment())
        this.effect(() => {
            if (this.showDataType.value === "equipment") {
                equipmentBtn.getComponent(Sprite).color = new Color(255, 255, 255)
                itemBtn.getComponent(Sprite).color = new Color(180, 180, 180)
                this.initEquipments()
            }
            if (this.showDataType.value === "item") {
                equipmentBtn.getComponent(Sprite).color = new Color(180, 180, 180)
                itemBtn.getComponent(Sprite).color = new Color(255, 255, 255)
                this.initItem()
            }
        })
    }

    // 关闭
    protected close() {
        this.node.active = false
    }

    // 初始化物品
    protected initItem() {
        const canvasNode = find('Canvas')
        const containerNode = this.node.getChildByName("EquipmentItem")
            .getChildByName("Content").getComponent(ScrollView).content
        containerNode.removeAllChildren()
        backpackManager.data.items.forEach(async dto => {
            if (dto.count === 0) return
            const instance = new ItemInstance({
                count: dto.count,
                Proto: getItemPrototype(dto.prototype)
            })
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            const equipmentItemPrefab = node.getComponent(EquipmentItemPrefab)
            equipmentItemPrefab.setInfo(instance, async () => {
                const node = CcNative.instantiate(this.DetailInfoPrefab)
                node.getComponent(DetailInfoPrefab).setDetail({
                    content: [{
                        title: instance.proto.name,
                        icon: await instance.proto.icon(),
                        bottomMessage: instance.proto.description,
                        buttons: instance.proto.canUse ? [{
                            label: LanguageManager.getEntry("Use").getValue(settingManager.data.language),
                            callback: (close) => {
                                backpackManager.data.useItem(instance, 1)
                                if (dto.count === 0) close()
                            },
                        }] : []
                    }],
                    closeCallback: () => canvasNode.removeChild(node)
                })
                canvasNode.addChild(node)
            })
            containerNode.addChild(node)
        })
    }

    // 初始化未装备的装备
    protected initEquipments() {
        const canvasNode = find('Canvas')
        const containerNode = this.node.getChildByName("EquipmentItem")
            .getChildByName("Content").getComponent(ScrollView).content
        containerNode.removeAllChildren()
        equipmentManager.data.equipments.forEach(dto => {
            const instance = new EquipmentInstance({
                id: dto.id,
                lv: dto.lv,
                quality: dto.quality,
                Proto: getEquipmentPrototype(dto.prototype)
            })
            const comparisonDTO: EquipmentDTO = equipmentManager.data.equipment[instance.proto.type]
            const comparison = comparisonDTO ? new EquipmentInstance({
                id: comparisonDTO.id,
                lv: comparisonDTO.lv,
                quality: comparisonDTO.quality,
                Proto: getEquipmentPrototype(comparisonDTO.prototype)
            }) : null
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            const equipmentItemPrefab = node.getComponent(EquipmentItemPrefab)
            equipmentItemPrefab.setInfo(instance, () => showDetail(instance, comparison, equipmentItemPrefab))
            containerNode.addChild(node)
        })
        // 展示详情
        const showDetail = async (
            instance: EquipmentInstance,
            comparison: EquipmentInstance,
            equipmentItemPrefab: EquipmentItemPrefab
        ) => {
            if (!instance) return
            const node = CcNative.instantiate(this.DetailInfoPrefab)
            const content = []
            if (comparison) {
                content.push({
                    title: comparison.proto.name,
                    icon: await comparison.proto.icon(),
                    rightMessage: comparison.proto.propertyDescription,
                    bottomMessage: comparison.proto.description,
                    boxIcon: equipmentItemPrefab.getQualitySpriteFrame(comparison.quality),
                })
            }
            content.push({
                title: instance.proto.name,
                icon: await instance.proto.icon(),
                rightMessage: instance.proto.propertyDescription,
                bottomMessage: instance.proto.description,
                boxIcon: equipmentItemPrefab.getQualitySpriteFrame(instance.quality),
                buttons: [
                    {
                        label: LanguageManager.getEntry("Equipment").getValue(settingManager.data.language),
                        callback: (close: Function) => {
                            close()
                            equipmentManager.data.equip(instance)
                            equipmentManager.save()
                        }
                    }
                ]
            })
            node.getComponent(DetailInfoPrefab).setDetail({
                content,
                closeCallback: () => canvasNode.removeChild(node)
            })
            canvasNode.addChild(node)
        }
    }

    // 初始化已经装备的装备
    protected initHasEquipment() {
        const hasEquipmentNode = this.node.getChildByName("InfoPanel").getChildByName("HasEquipment")
        const character = createPlayerInstance()
        // 展示详情
        const showDetail = async (instance: EquipmentInstance) => {
            if (!instance) return
            const node = CcNative.instantiate(this.DetailInfoPrefab)
            node.getComponent(DetailInfoPrefab).setDetail({
                content: [
                    {
                        title: instance.proto.name,
                        icon: await instance.proto.icon(),
                        rightMessage: instance.proto.propertyDescription,
                        bottomMessage: instance.proto.description,
                        boxIcon: hasEquipmentNode.children[0]
                            .getComponent(EquipmentItemPrefab)
                            .getQualitySpriteFrame(instance.quality),
                        buttons: [
                            {
                                label: LanguageManager.getEntry("Unload").getValue(settingManager.data.language),
                                callback: () => {
                                    equipmentManager.data.unequip(instance.proto.type)
                                    this.node.removeChild(node)
                                    equipmentManager.save()
                                }
                            }
                        ]
                    }
                ],
                closeCallback: () => this.node.removeChild(node)
            })
            this.node.addChild(node)
        }
        // 渲染装备
        this.effect(() => {
            hasEquipmentNode.getChildByName("Weapon").getComponent(EquipmentItemPrefab)
                .setInfo(
                    character.equipments.weapon,
                    character.equipments.weapon ? () => showDetail(character.equipments.weapon) : void 0
                )
            hasEquipmentNode.getChildByName("Armor").getComponent(EquipmentItemPrefab)
                .setInfo(
                    character.equipments.armor,
                    character.equipments.armor ? () => showDetail(character.equipments.armor) : void 0
                )
            hasEquipmentNode.getChildByName("Accessory").getComponent(EquipmentItemPrefab)
                .setInfo(
                    character.equipments.accessory,
                    character.equipments.accessory ? () => showDetail(character.equipments.accessory) : void 0
                )
            hasEquipmentNode.getChildByName("Shoes").getComponent(EquipmentItemPrefab)
                .setInfo(
                    character.equipments.shoes,
                    character.equipments.shoes ? () => showDetail(character.equipments.shoes) : void 0
                )
        })
        return
    }

    protected changeToItem() { this.showDataType.value = "item" }
    protected changeToEquipment() { this.showDataType.value = "equipment" }

}
