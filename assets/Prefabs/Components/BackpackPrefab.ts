import { _decorator, Component, Node, Prefab, SpriteFrame } from 'cc';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { equipmentManager } from '../../Script/Game/Manager/EquipmentManager';
import { EquipmentItemPrefab } from './EquipmentItemPrefab';
import { createPlayerInstance } from '../../Script/Game/Share';
import { CcNative } from '../../Script/Module/CcNative';
import { DetailInfoPrefab } from './DetailInfoPrefab';
import { EquipmentInstance } from '../../Script/System/Core/Instance/EquipmentInstance';
import { LanguageManager } from '../../Script/Module/Language/LanguageManager';
import { settingManager } from '../../Script/Game/Manager/SettingManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasBackpack')
export class ScenesMainCanvasBackpack extends ExtensionComponent {

    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null

    protected start(): void {
        this.effect(() => this.initHasEquipment())
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
                        title: instance.proto.name ,
                        icon: await instance.proto.icon() ,
                        bottomMessage: instance.proto.description,
                        buttons: [
                            {
                                label: LanguageManager.getEntry("Unload").getValue(settingManager.data.language) , 
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
            if (character.equipments.weapon) {
                hasEquipmentNode.getChildByName("Weapon").getComponent(EquipmentItemPrefab)
                .setInfo(character.equipments.weapon , () => showDetail(character.equipments.weapon))
            } else {
                hasEquipmentNode.getChildByName("Weapon").getComponent(EquipmentItemPrefab)
                .setInfo(null)
            }
        })
        this.effect(() => {
            if (character.equipments.armor) {
                hasEquipmentNode.getChildByName("Armor").getComponent(EquipmentItemPrefab)
                .setInfo(character.equipments.armor , () => showDetail(character.equipments.armor))
            } else {
                hasEquipmentNode.getChildByName("Armor").getComponent(EquipmentItemPrefab)
                .setInfo(null)
            }
        })
        this.effect(() => {
            if (character.equipments.accessory) {
                hasEquipmentNode.getChildByName("Accessory").getComponent(EquipmentItemPrefab)
                .setInfo(character.equipments.accessory , () => showDetail(character.equipments.accessory))
            } else {
                hasEquipmentNode.getChildByName("Accessory").getComponent(EquipmentItemPrefab)
                .setInfo(null)
            }
        })
        this.effect(() => {
            if (character.equipments.shoes) {
                hasEquipmentNode.getChildByName("Shoes").getComponent(EquipmentItemPrefab)
                .setInfo(character.equipments.shoes , () => showDetail(character.equipments.shoes))
            } else {
                hasEquipmentNode.getChildByName("Shoes").getComponent(EquipmentItemPrefab)
                .setInfo(null)
            }
        })
        return
    }

}
