import { _decorator, Button, CCFloat, EventMouse, EventTouch, Node, Size, UITransform, v2, Vec2 } from "cc";
import ExtensionComponent from "../Extension/Component/ExtensionComponent";
import { ScrollView } from "../../../scripting/engine/typedoc-index";
const { ccclass, property, menu } = _decorator;

@ccclass('ModuleVirtualListPrefab')
export class ModuleVirtualListPrefab extends ExtensionComponent {

    // 容器节点，用于存放列表项
    @property(Node)
    public readonly content: Node = null;

    // 横向空距离
    @property(CCFloat)
    public readonly spaceX: number = 0;

    // 纵向空距离
    @property(CCFloat)
    public readonly spaceY: number = 0;

    // 最大高度
    protected maxHeight: number = 0;

    // 滚动距离
    protected _scrollTop: number = 0;
    public get scrollTop(): number { return this._scrollTop; }

    // 内容宽高
    protected _contentSize: Size = null;
    public get contentSize(): Size { return this._contentSize; }

    // 数据列表
    protected _dataList: any[] = []

    // 数据转换为节点的函数
    protected _dataToNode: (data: any, index: number) => Node = null

    // 设置数据列表
    protected setDataList<T>(dataList: T[]) {
        this._dataList = dataList;
    }

    // 设置数据转换为节点的函数
    protected setDataToNode<T>(dataToNode: (data: T, index: number) => Node) {
        this._dataToNode = dataToNode;
    }

    // 启动列表
    public setVirtualList<T>(
        dataList: T[],
        dataToNode: (data: T, index: number) => Node,
    ) {
        // 初始化最大高度
        this.maxHeight = 0
        // 清空内容
        this.content.removeAllChildren()
        // 设置数据列表
        this.setDataList(dataList);
        // 设置数据转换为节点的函数
        this.setDataToNode(dataToNode);
        // 初次渲染列表
        this.renderList();
    }

    // 初始化
    protected onLoad(): void {
        this.registerEvent();
    }

    // 绑定事件
    protected registerEvent() {
        this.content.on(Node.EventType.TOUCH_START, this.touchStartEvent, this , true)
        this.content.on(Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this , true)
        this.content.on(Node.EventType.TOUCH_END, this.touchEndEvent, this , true)
        this.content.on(Node.EventType.TOUCH_CANCEL, this.touchEndEvent, this , true)
    }

    // 是否在滚动中
    protected isScrolling: boolean = false;

    // 开始时间
    protected startTimer: number = 0;

    // 移动距离 
    protected moveDistance: Vec2 = v2(0 , 0)

    // 触摸开始事件
    protected touchStartEvent(e: EventTouch) {
        this.isScrolling = true;
        this.startTimer = Date.now();
        this.moveDistance = v2(0 , 0)
    }

    // 触摸移动事件
    protected touchMoveEvent(e: EventTouch) {
        if (this.isScrolling) {
            this.direction = e.getDelta()
            this.moveDistance.y += e.getDeltaY()
        }
    }

    // 触摸结束事件 
    protected touchEndEvent(e: EventTouch, captureListeners?: Node[]) {
        this.isScrolling = false;
        // 不是点击
        if (Date.now() - this.startTimer > 200) {

        }
    }

    // 渲染列表
    protected renderList() {
        // 获取容器节点宽高
        if (!this._contentSize) {
            const uiTransform = this.content.getComponent(UITransform)
            this._contentSize = new Size(uiTransform.width, uiTransform.height)
        }
        // 遍历渲染
        let spaceY = 0, spaceX = 0, currentMaxHeight = 0, hasEnterRenderArea = false, completeRender = true
        // 需要渲染的节点
        const needRenderNode: { x: number, y: number, node: Node }[] = []
        for (let index = 0; index < this._dataList.length; index++) {
            const data = this._dataList[index];
            const node = this._dataToNode(data, index)
            if (!node) continue
            const uiTransform = node.getComponent(UITransform)
            // 判断是否满足换行
            if (spaceX + uiTransform.width > this._contentSize.width) {
                spaceX = 0
                spaceY += currentMaxHeight + this.spaceY
                currentMaxHeight = uiTransform.height
            } else {
                currentMaxHeight = Math.max(currentMaxHeight, uiTransform.height)
            }
            // 判断是否在渲染范围内
            if (spaceY - this.scrollTop < this.contentSize.height && spaceY - this.scrollTop + uiTransform.height > 0) {
                // 到达渲染范围
                hasEnterRenderArea = true
                // 添加到需要渲染的队列
                needRenderNode.push({
                    node,
                    x: spaceX + uiTransform.width / 2 - this._contentSize.width / 2,
                    y: -(spaceY - this.scrollTop + uiTransform.height / 2 - this._contentSize.height / 2),
                })
            }
            // 不在渲染范围
            else {
                // 已经经过需要渲染的区域后离开则后续不需要继续进行
                if (hasEnterRenderArea) {
                    completeRender = false
                    break
                }
            }
            // 添加行的移动位置
            spaceX += uiTransform.width + this.spaceX
        }
        // 是否全部都进行了渲染
        if (completeRender) {
            // 更新最大高度
            this.maxHeight = spaceY + currentMaxHeight
        }
        // 渲染对比节点
        if (needRenderNode.length > 0) {
            const children = this.content.children
            for (let i = 0; i < children.length; i++) {
                const childrenNode = children[i]
                const item = needRenderNode.find(item => item.node === childrenNode)
                // 移除不该渲染的节点
                if (!item) this.content.removeChild(childrenNode)
                // 更新位置
                else item.node.setPosition(item.x, item.y)
            }
            // 渲染新增节点
            needRenderNode.forEach(item => {
                item.node.setPosition(item.x, item.y)
                if (item.node.parent !== this.content) 
                    this.content.addChild(item.node)
            })
        } else {
            this.content.removeAllChildren()
        }
    }

    // 方向向量
    protected direction: Vec2 = v2(0, 0)

    // 每一帧根据方向向量移动
    protected update(dt: number) {
        const reduceDown = 40
        let lastScrollTop = this._scrollTop
        this._scrollTop += this.direction.y * dt * 200
        if (this.direction.y !== 0) {
            if (this.direction.y > 0) {
                this.direction.y -= dt * reduceDown
                if (this.direction.y < 0) this.direction.y = 0
            } else if (this.direction.y < 0) {
                this.direction.y += dt * reduceDown
                if (this.direction.y > 0) this.direction.y = 0
            }
        }
        if (this.maxHeight !== 0) {
            if (this.maxHeight < this.contentSize.height) this._scrollTop = 0
            if (this.maxHeight - this.contentSize.height + 5 < this.scrollTop)
                this._scrollTop = this.maxHeight - this.contentSize.height + 5
        }
        if (this.scrollTop < 0) this._scrollTop = 0
        if (this._scrollTop !== lastScrollTop) this.renderList()
        return
    }

}