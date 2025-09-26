import { _decorator, Prefab, Sprite, Color, find, ScrollView, Label } from "cc";
import { CcNative } from "../../Module/CcNative";
import ExtensionComponent from "../../Module/Extension/Component/ExtensionComponent";
import { LanguageManager } from "../../Module/Language/LanguageManager";
import { Rx } from "../../Module/Rx";
import { ReactiveEffectRunner } from "../../Module/Rx/reactivity";
import { backpackManager } from "../../Script/Game/Manager/BackpackManager";
import { equipmentManager } from "../../Script/Game/Manager/EquipmentManager";
import { settingManager } from "../../Script/Game/Manager/SettingManager";
import { createPlayerInstance } from "../../Script/Game/Share";
import { EquipmentInstance } from "../../Script/System/Core/Instance/EquipmentInstance";
import { ItemInstance } from "../../Script/System/Core/Instance/ItemInstance";
import { EquipmentDTO } from "../../Script/System/Core/Prototype/EquipmentPrototype";
import { getEquipmentPrototype } from "../../Script/System/Manager/EquipmentManager";
import { getItemPrototype } from "../../Script/System/Manager/ItemManager";
import { Normal } from "../../Script/System/Normal";
import { DetailInfoPrefab } from "./DetailInfoPrefab";
import { EquipmentItemPrefab } from "./EquipmentItemPrefab";

const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasBackpack')
export class ScenesMainCanvasBackpack extends ExtensionComponent {

    @property(Prefab)
    protected DetailInfoPrefab: Prefab = null

    @property(Prefab)
    protected EquipmentItemPrefab: Prefab = null

    // 修改展示数据
    public showDataType = Rx.ref("equipment") // equipment | item

    // 修改是否展示详细信息
    public showDetailProperty = Rx.ref(false)

    // 开始生命周期
    protected start(): void {
        const itemBtn = this.node.getChildByName("Ui").getChildByName("Item")
        const equipmentBtn = this.node.getChildByName("Ui").getChildByName("Equipment")
        // this.effect(() => this.initDetail())
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
        // this.effect(() => this.node.getChildByName("DetailProoerty").active = this.showDetailProperty.value)
    }

    // 关闭
    protected close() {
        this.node.active = false
        this.closeShowUserDetail()
        this.changeToItem()
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
            const sprite = await instance.proto.icon()
            const node = CcNative.instantiate(this.EquipmentItemPrefab)
            const equipmentItemPrefab = node.getComponent(EquipmentItemPrefab)
            const effects: ReactiveEffectRunner[] = []
            const detailNode = CcNative.instantiate(this.DetailInfoPrefab)
            equipmentItemPrefab.setInfo(instance, async () => {
                const effect = this.effect(() => {
                    const instance = new ItemInstance({
                        count: backpackManager.data.items.find(i => i.prototype === dto.prototype)?.count ?? 0,
                        Proto: getItemPrototype(dto.prototype)
                    })
                    detailNode.getComponent(DetailInfoPrefab).setDetail({
                        content: [{
                            title: instance.proto.name,
                            icon: sprite,
                            rightMessage: LanguageManager.getEntry("Count")
                                .getValue(settingManager.data.language) +
                                " " +
                                instance.count,
                            bottomMessage: instance.proto.description,
                            buttons: instance.proto.canUse ? [{
                                label: LanguageManager.getEntry("Use").getValue(settingManager.data.language),
                                callback: (close) => {
                                    backpackManager.data.useItem(instance, 1)
                                    const count = backpackManager.data.items.find(
                                        i => i.prototype === dto.prototype
                                    )?.count ?? 0
                                    if (count <= 0) {
                                        close()
                                        effects.forEach(c => c())
                                        effects.length = 0
                                        return
                                    }
                                },
                            }] : []
                        }],
                        closeCallback: () => canvasNode.removeChild(detailNode)
                    })
                })
                canvasNode.addChild(detailNode)
                effects.push(effect)
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

    // // 初始化详细信息
    // protected async initDetail() {
    //     const characterInstance = createPlayerInstance()
    //     const detailPropertyNode = this.node.getChildByName("DetailProoerty")
    //     const avatarSprite = detailPropertyNode.getChildByName("Avatar").getComponent(Sprite)
    //     detailPropertyNode.getChildByName("Title")
    //         .getComponent(Label).string = characterInstance.proto.name
    //     detailPropertyNode.getChildByName("Detail")
    //         .getComponent(ScrollView).content.getComponent(Label).string = characterInstance.proto.description
    //     // 渲染其他属性
    //     const label = detailPropertyNode.getChildByName("Property")
    //         .getComponent(ScrollView)
    //         .content
    //         .getComponent(Label)
    //     label.string = ""
    //     const property = [
    //         { key: "maxHp", force: false, fixed: 0, rate: 1, exit: "" },
    //         { key: "maxMp", force: false, fixed: 0, rate: 1, exit: "" },
    //         { key: "physicalAttack", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "magicAttack", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "lightAttack", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "darkAttack", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "physicalDefense", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "magicDefense", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "lightResistance", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "darkResistance", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "physicalPenetration", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "magicPenetration", force: false, fixed: 1, rate: 1, exit: "" },
    //         { key: "criticalRate", force: false, fixed: 1, rate: 100, exit: "%" },
    //         { key: "criticalDamage", force: false, fixed: 1, rate: 100, exit: "%" },
    //         { key: "attackSpeed", force: true, fixed: 2, rate: 1, exit: "" },
    //     ]
    //     property.forEach(setting => {
    //         label.string += `${LanguageManager.getEntry(setting.key).getValue(settingManager.data.language)
    //             }: ${Normal.number(characterInstance[setting.key] * setting.rate, setting.fixed, setting.force)}${setting.exit}\n`
    //     })
    //     avatarSprite.spriteFrame = await characterInstance.proto.icon()
    // }

    // 改变展示类型
    protected changeToItem() { this.showDataType.value = "item" }
    protected changeToEquipment() { this.showDataType.value = "equipment" }

    // 改变展示用户详细信息
    protected openShowUserDetail() { this.showDetailProperty.value = true }
    protected closeShowUserDetail() { this.showDetailProperty.value = false }

}
