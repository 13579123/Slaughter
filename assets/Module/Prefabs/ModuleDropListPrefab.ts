import { _decorator, Button, Color, Component, error, EventHandheld, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, UITransform } from 'cc';
import ExtensionComponent from '../Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

export type SelectItemOption = {
    // 空选项显示
    noneTitle?: string,
    // 默认值
    default?: any,
    // 是否多选
    multiple?: boolean,
    // 是否必选
    require?: boolean,
    // 改变函数
    onchange?: (arg: any[]) => any,
    // 列表
    list: { key: string, value: any }[],
}

@ccclass('ModuleDropListPrefab')
export class ModuleDropListPrefab extends ExtensionComponent {

    @property(Label)
    protected TitleLabel: Label = null

    @property(Node)
    protected TriangleNode: Node = null

    @property(Node)
    protected ListNode: Node = null

    @property(Node)
    protected ListContainer: Node = null

    @property(Node)
    protected TempItemNode: Node = null

    @property(SpriteFrame)
    protected DefaultSpriteFrame: SpriteFrame = null

    @property(SpriteFrame)
    protected SelectedSpriteFrame: SpriteFrame = null

    public value: any[] = []

    public multiple: boolean = false

    protected currentState: "drop" | "none" = "none"

    protected isAnimationing: boolean = false

    protected onLoad(): void {
        this.ListNode.active = false
        this.TempItemNode.parent = null
    }

    protected async changeSelectType() {
        if (this.isAnimationing) return
        let addRow = 1
        if (this.currentState === "drop") {
            this.currentState = 'none'
            addRow = -1
        }
        else if (this.currentState === "none") {
            this.currentState = 'drop'
            addRow = 1
        }
        this.isAnimationing = true
        const p1 = new Promise(res => {
            this.setAutoInterval(() => {
                this.TriangleNode.angle = this.TriangleNode.angle + addRow * 6
            }, { timer: 15, count: 15, complete: () => res(0) })
        })
        if (this.currentState === "drop") {
            this.ListNode.active = true
            const p2 = new Promise(res => {
                const sprite = this.ListNode.getComponent(Sprite)
                let posY = 20, a = 0
                sprite.color = new Color(255, 255, 255, a)
                this.ListNode.setPosition(this.ListNode.position.x, posY, this.ListNode.position.z)
                this.setAutoInterval(() => {
                    posY -= 1
                    sprite.color = new Color(255, 255, 255, a += 12.75)
                    this.ListNode.setPosition(this.ListNode.position.x, posY, this.ListNode.position.z)
                }, { timer: 15, count: 20, complete: () => res(0) })
            })
            await Promise.all([p1, p2])
        } else if (this.currentState === "none") {
            const p2 = new Promise(res => {
                const sprite = this.ListNode.getComponent(Sprite)
                let posY = 0, a = 225
                sprite.color = new Color(255, 255, 255, a)
                this.ListNode.setPosition(this.ListNode.position.x, posY, this.ListNode.position.z)
                this.setAutoInterval(() => {
                    posY += 1
                    sprite.color = new Color(255, 255, 255, a -= 12.75)
                    this.ListNode.setPosition(this.ListNode.position.x, posY, this.ListNode.position.z)
                }, { timer: 15, count: 20, complete: () => res(0) })
            })
            await Promise.all([p1, p2])
            this.ListNode.active = false
        }
        this.isAnimationing = false
        return
    }

    public setSelectList(option: SelectItemOption) {
        this.ListContainer.removeAllChildren()
        this.value = option.default !== void 0 ? [option.default] : []
        this.multiple = option.multiple || false
        const spriteList = []
        if (option.default === void 0 && option.require) {
            error("Mandatory items must include available default values")
            return
        }
        option.list.forEach(item => {
            const node = this.createItemNode()
            const sprite = node.getComponent(Sprite)
            spriteList.push(sprite)
            node.getChildByName("Key").getComponent(Label).string = item.key
            node.on(Button.EventType.CLICK, () => {
                const index = this.value.indexOf(item.value)
                if (index !== -1) {
                    if (!option.require || this.value.length > 1) {
                        this.value.splice(index, 1)
                        sprite.spriteFrame = this.DefaultSpriteFrame
                    }
                } else {
                    if (this.multiple) {
                        this.value.push(item.value)
                        sprite.spriteFrame = this.SelectedSpriteFrame
                    } else {
                        spriteList.forEach(s => s.spriteFrame = this.DefaultSpriteFrame)
                        this.value = [item.value]
                        sprite.spriteFrame = this.SelectedSpriteFrame
                    }
                }
                if (this.value.length === 1 && this.value[0] === item.value) this.TitleLabel.string = item.key
                else if (this.value.length > 1) this.TitleLabel.string = "......"
                else this.TitleLabel.string = option.noneTitle || "请选择"
                option.onchange && option.onchange(this.value)
            })
            // 初始化展示
            const index = this.value.indexOf(item.value)
            if (index !== -1) sprite.spriteFrame = this.SelectedSpriteFrame
            else sprite.spriteFrame = this.DefaultSpriteFrame
            // 添加节点
            this.ListContainer.addChild(node)
        })
        // 初始化展示
        if (this.value.length === 1) {
            for (let i = 0; i < option.list.length; i++) {
                const item = option.list[i];
                if (item.value === this.value[0]) this.TitleLabel.string = item.key
            }
        }
        else if (this.value.length > 1) this.TitleLabel.string = "......"
        else this.TitleLabel.string = option.noneTitle || "请选择"
        return
    }

    protected createItemNode() { return instantiate(this.TempItemNode) }

}
