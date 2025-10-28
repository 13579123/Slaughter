import { _decorator, Component, find, Node, Prefab, ScrollView } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { EquipmentDTO, EquipmentQuality } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { ItemDTO } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { EquipmentItemPrefab } from '../EquipmentItemPrefab';
import { ItemInstance } from 'db://assets/Script/System/Core/Instance/ItemInstance';
import { getItemPrototype } from 'db://assets/Script/System/Manager/ItemManager';
import { DetailInfoPrefab } from '../DetailInfoPrefab';
import { EquipmentInstance } from 'db://assets/Script/System/Core/Instance/EquipmentInstance';
import { getEquipmentPrototype } from 'db://assets/Script/System/Manager/EquipmentManager';
const { ccclass, property } = _decorator;

@ccclass('MessageCongratulationsPrefab')
export class MessageCongratulationsPrefab extends ExtensionComponent {

    @property(Prefab)
    protected EquipmentItemPrefab: Prefab = null

    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null

    protected closeCallback: Function = null

    protected closeCongratulation() {
        this.node.active = false
        if (this.closeCallback) this.closeCallback()
    }

    public setCongratulation(
        gold: number , 
        diamond: number , 
        items: ItemDTO[] , 
        equipments: EquipmentDTO[] , 
        closeCallback: Function
    ) {
        this.closeCallback = closeCallback
        const canvasNode = find("Canvas")
        const containerNode = this.node.getChildByName("ScrollView").getComponent(ScrollView).content
        containerNode.removeAllChildren()
        // 添加item展示
        const addItem = (instance: ItemInstance) => {
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            node.getComponent(EquipmentItemPrefab).setInfo(instance , async () => {
                const detailNode = CcNative.instantiate(this.DetailInfoPrefab)
                detailNode.getComponent(DetailInfoPrefab).setDetail({
                    content: [
                        {
                            title: instance.proto.name , 
                            icon: await instance.proto.icon() ,
                            bottomMessage: instance.proto.description , 
                        } ,
                    ]
                })
                canvasNode.addChild(detailNode)
            })
            containerNode.addChild(node)
        }
        // 添加equipment展示
        const addEquipment = (instance: EquipmentInstance) => {
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            const equipmentItem = node.getComponent(EquipmentItemPrefab)
            equipmentItem.setInfo(instance , async () => {
                const detailNode = CcNative.instantiate(this.DetailInfoPrefab)
                detailNode.getComponent(DetailInfoPrefab).setDetail({
                    content: [
                        {
                            title: instance.proto.name , 
                            boxIcon: equipmentItem.getQualitySpriteFrame(instance.quality),
                            rightMessage: instance.proto.propertyDescription , 
                            bottomMessage: instance.proto.description , 
                            icon: await instance.proto.icon()
                        } ,
                    ]
                })
                canvasNode.addChild(detailNode)
            })
            containerNode.addChild(node)
        }
        if (gold) {
            const instance = new ItemInstance({Proto: getItemPrototype("Gold") , count: gold})
            addItem(instance)
        }
        if (diamond) {
            const instance = new ItemInstance({Proto: getItemPrototype("Diamond") , count: diamond})
            addItem(instance)
        }
        if (items) {
            items.forEach(item => {
                if (!item || !item.prototype || !getItemPrototype(item.prototype)) return
                const instance = new ItemInstance({Proto: getItemPrototype(item.prototype) , count: item.count})
                addItem(instance)
            })
        }
        if (equipments) {
            equipments.forEach(equip => {
                if (!equip || !equip.prototype || !getEquipmentPrototype(equip.prototype)) return
                const instance = new EquipmentInstance({
                    lv: equip.lv,
                    id: equip.id,
                    quality: equip.quality,
                    extraProperty: equip.extraProperty,
                    Proto: getEquipmentPrototype(equip.prototype),
                })
                addEquipment(instance)
            })
        }
        return
    }

}


