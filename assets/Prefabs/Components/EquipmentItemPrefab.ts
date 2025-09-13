import { _decorator, Component, Node, Sprite, SpriteFrame, Enum } from 'cc';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { EquipmentInstance } from '../../Script/System/Core/Instance/EquipmentInstance';
import { EquipmentQuality } from '../../Script/System/Core/Prototype/EquipmentPrototype';
import { ItemInstance } from '../../Script/System/Core/Instance/ItemInstance';
const { ccclass, property } = _decorator;

@ccclass('EquipmentItemPrefab')
export class EquipmentItemPrefab extends ExtensionComponent {

    @property(SpriteFrame)
    protected OrdinaryQuality: SpriteFrame = null;
    @property(SpriteFrame)
    protected FineQuality: SpriteFrame = null;
    @property(SpriteFrame)
    protected RareQuality: SpriteFrame = null;
    @property(SpriteFrame)
    protected EpicQuality: SpriteFrame = null;
    @property(SpriteFrame)
    protected LegendaryQuality: SpriteFrame = null;
    @property(SpriteFrame)
    protected MythicQuality: SpriteFrame = null;

    @property(Sprite)
    protected ItemIconSprite: Sprite = null;

    @property({type: Enum({ 
        Weapon: "Weapon", 
        Shose: "Shose", 
        Armor: "Armor", 
        Accessory: "Accessory", 
        None: "None"
    })})
    protected ShadowType: "Weapon"|"Shose"|"Armor"|"Accessory"|"None" = "None"

    // 装备信息实例
    protected instance: EquipmentInstance|ItemInstance = null;

    public start(): void {
        // 初始化装备item
        this.setInfo(null)
    }

    // 开启虚影
    protected openShadow(): void {
        if (this.ShadowType === "None") return this.closeShadow()
        if (this.ShadowType === "Weapon") this.node.getChildByName("Weapon").active = true
        if (this.ShadowType === "Shose") this.node.getChildByName("Shose").active = true
        if (this.ShadowType === "Armor") this.node.getChildByName("Armor").active = true
        if (this.ShadowType === "Accessory") this.node.getChildByName("Accessory").active = true
    }

    // 关闭虚影
    protected closeShadow(): void {
        if (this.ShadowType === "Weapon") this.node.getChildByName("Weapon").active = false
        if (this.ShadowType === "Shose") this.node.getChildByName("Shose").active = false
        if (this.ShadowType === "Armor") this.node.getChildByName("Armor").active = false
        if (this.ShadowType === "Accessory") this.node.getChildByName("Accessory").active = false
    }

    // 根据品质获取spriteframe
    public getQualitySpriteFrame(quality: EquipmentQuality): SpriteFrame {
        if (quality === EquipmentQuality.Ordinary) return this.OrdinaryQuality
        if (quality === EquipmentQuality.Fine) return this.FineQuality
        if (quality === EquipmentQuality.Rare) return this.RareQuality
        if (quality === EquipmentQuality.Epic) return this.EpicQuality
        if (quality === EquipmentQuality.Legendary) return this.LegendaryQuality
        if (quality === EquipmentQuality.Mythic) return this.MythicQuality
        return this.OrdinaryQuality
    }

    // 设置装备或者物品信息
    public setInfo(instance: EquipmentInstance|ItemInstance) {
        this.instance = instance
        const sprite = this.node.getComponent(Sprite)
        if (!instance) {
            sprite.spriteFrame = this.OrdinaryQuality
            this.ItemIconSprite.spriteFrame = null
            this.openShadow()
            return
        }
        if (instance instanceof EquipmentInstance) {
            sprite.spriteFrame = this.getQualitySpriteFrame(instance.quality)
            this.closeShadow()
        }
        instance.proto.icon().then((spriteFrame) => {
            if (this.instance === instance)
                this.ItemIconSprite.spriteFrame = spriteFrame
        })
    }

    // 点击装备图标回调
    public showDetail(parmas: "Comparison"|"Show" = "Show") {
        if (this.instance === null) return
        
    }

}


