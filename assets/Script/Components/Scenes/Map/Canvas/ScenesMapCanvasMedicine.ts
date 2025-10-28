import { _decorator, Color, Component, Node, Sprite, Prefab, instantiate } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { ModuleVirtualListPrefab } from 'db://assets/Module/Prefabs/ModuleVirtualListPrefab';
import { Rx } from 'db://assets/Module/Rx';
import { EquipmentItemPrefab } from 'db://assets/Prefabs/Components/EquipmentItemPrefab';
import { backpackManager } from 'db://assets/Script/Game/Manager/BackpackManager';
import { levelDataManager } from 'db://assets/Script/Game/Manager/LevelDataManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { ItemInstance } from 'db://assets/Script/System/Core/Instance/ItemInstance';
import { getMedicineItemPrototype } from 'db://assets/Script/System/Manager/ItemManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasMedicine')
export class ScenesMapCanvasMedicine extends ExtensionComponent {

    // 所有item界面
    @property(Node)
    protected AllMedicinePanel: Node = null

    @property(Node)
    protected HasSelectMeidicinePanel: Node = null

    @property(Node)
    protected allMedicineItemTemplate: Node = null

    @property(Node)
    protected selectedMedicineItemTemplate: Node = null

    // 当前是否显示所有
    protected showAll = Rx.ref(false)

    // 是否在动画中
    protected isAnimation = false

    // 选择的item
    protected selectItems = Rx.reactive<string[]>(Array.from(levelDataManager.data.medicineList))

    // 药品时间
    protected medicineTime = Rx.ref(0)

    // 初始化
    protected start() {
        // 移除模板
        this.allMedicineItemTemplate.parent = null
        this.selectedMedicineItemTemplate.parent = null
        // 渲染所有物品
        this.renderAllMedicine()
        // 渲染物品
        this.effect(() => this.renderMedicine())
        // 计时
        this.effect(() => {
            const content = this.HasSelectMeidicinePanel.getChildByName("HasSelectMeidicine")
            if (this.medicineTime.value > 0) {
                content.children.forEach(node => {
                    const mask = node.getChildByName("Mask")
                    mask.active = true
                    mask.getComponent(Sprite).fillRange = this.medicineTime.value / 1000
                })
            } else {
                content.children.forEach(node => {
                    const mask = node.getChildByName("Mask")
                    mask.active = false
                })
            }
        })
    }

    // 渲染物品
    protected renderMedicine() {
        const content = this.HasSelectMeidicinePanel.getChildByName("HasSelectMeidicine")
        const children = Array.from(content.children)
        content.removeAllChildren()
        children.forEach(c => c.destroy())
        this.selectItems.forEach(item => {
            const count = backpackManager.data.items.find(
                dto => dto.prototype === item
            )?.count
            if (!count) return
            const node = instantiate(this.selectedMedicineItemTemplate)
            const mask = node.getChildByName("Mask")
            mask.active = false
            const instance = new ItemInstance({Proto: getMedicineItemPrototype(item) , count})
            node.getChildByName("EquipmentItemPrefab").getComponent(EquipmentItemPrefab).setInfo(
                instance ,
                // 点击事件
                () => {
                    if (this.medicineTime.value > 0) 
                        return message.toast((new class extends LanguageEntry {
                            public get chs(): string {return "药剂冷却中"}
                            public get eng(): string {return "Medicine cooling down"}
                            public get jpn(): string {return "薬物の冷却中"}
                        }).getValue(settingManager.data.language))
                    this.medicineTime.value = 1000
                    this.setAutoInterval(() => this.medicineTime.value -= 20 , {timer: 20 , count: 50})
                    // 物品使用
                    backpackManager.data.useItem(instance , 1)
                    this.renderAllMedicine()
                }
            )
            content.addChild(node)
        })
    }   

    // 渲染所有物品列表
    protected renderAllMedicine() {
        // 虚拟列表
        const moduleVirtualListPrefab = this.AllMedicinePanel
            .getChildByName("ModuleVirtualListPrefab").getComponent(ModuleVirtualListPrefab)
        // 药品items
        const items = backpackManager.data.items.map(itemDto => {
            if (itemDto.count > 0 && getMedicineItemPrototype(itemDto.prototype)) return itemDto
            return null
        }).filter(d => d)
        // 设置虚拟列表
        moduleVirtualListPrefab.setVirtualList(items , (dto) => {
            const node = instantiate(this.allMedicineItemTemplate)
            const mask = node.getChildByName("Mask")
            // 如果已经选择则遮罩
            if (this.selectItems.includes(dto.prototype)) mask.active = true
            else mask.active = false
            // 绑定点击事件
            node.getChildByName("EquipmentItemPrefab").getComponent(EquipmentItemPrefab).setInfo(
                new ItemInstance({ Proto: getMedicineItemPrototype(dto.prototype) , count: dto.count }) ,
                // 绑定点击事件
                () => {
                    const index = this.selectItems.indexOf(dto.prototype)
                    if (index !== -1) {
                        this.selectItems.splice(index , 1)
                        mask.active = false
                        levelDataManager.data.removeMedicine(dto.prototype)
                        levelDataManager.save()
                    } else {
                        if (this.selectItems.length >= 4) return message.toast("")
                        this.selectItems.push(dto.prototype)
                        mask.active = true
                        levelDataManager.data.addMedicine(dto.prototype , backpackManager)
                        backpackManager.save()
                        levelDataManager.save()
                    }
                }
            )
            return node
        })
    }

    // 展示隐藏所有
    protected showOrHideAllPanel() {
        if (this.isAnimation) return
        this.isAnimation = true
        const panel = this.AllMedicinePanel.getChildByName("Panel")
        const moduleVirtualListPrefab = this.AllMedicinePanel.getChildByName("ModuleVirtualListPrefab")
        const sprite = panel.getComponent(Sprite)
        const moduleVirtualListPrefabSprite = moduleVirtualListPrefab.getComponent(Sprite)
        if (this.showAll.value) {
            //隐藏
            this.showAll.value = false
            panel.setPosition(0 , 0)
            sprite.color = moduleVirtualListPrefabSprite.color = new Color(255 , 255 , 255 , 255)
            this.setAutoInterval(() => {
                panel.setPosition(panel.position.x - 4 , 0)
                moduleVirtualListPrefab.setPosition(panel.position.x - 4 , 0)
                sprite.color = moduleVirtualListPrefabSprite.color = new Color(255 , 255 , 255 , sprite.color.a - 12)
            } , { count: 25 , timer: 20 , complete: () => {this.AllMedicinePanel.active = false ; this.isAnimation = false} })
        } else {
            // 展示
            this.showAll.value = true
            this.AllMedicinePanel.active = true
            panel.setPosition(-100 , 0)
            sprite.color = moduleVirtualListPrefabSprite.color = new Color(255 , 255 , 255 , 0)
            this.setAutoInterval(() => {
                panel.setPosition(panel.position.x + 4 , 0)
                moduleVirtualListPrefab.setPosition(panel.position.x + 4 , 0)
                sprite.color = moduleVirtualListPrefabSprite.color = new Color(255 , 255 , 255 , sprite.color.a + 12)
            } , {count: 25 , timer: 20 , complete: () => {this.isAnimation = false}})
        }
        return
    }

    // 隐藏整个药箱
    protected hideAllMedicinePanel() {
        if (this.node.position.x === -300) {
            this.setAutoInterval(() => this.node.setPosition(this.node.position.x - 4 , 0) , {timer: 15 , count: 30})
        }
        if (this.node.position.x === -420) {
            this.setAutoInterval(() => this.node.setPosition(this.node.position.x + 4 , 0) , {timer: 15 , count: 30})
        }
    }

}


