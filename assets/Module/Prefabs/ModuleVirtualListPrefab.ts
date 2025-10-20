import { _decorator, CCFloat, EventTouch, Node, Size, UITransform } from "cc";
import ExtensionComponent from "../Extension/Component/ExtensionComponent";
const { ccclass, property } = _decorator;

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

    // 滚动距离
    protected _scrollTop: number = 0;
    public get scrollTop(): number { return this._scrollTop; }

    // 内容宽高
    protected _contentSize: Size = null;
    public get contentSize(): Size { return this._contentSize; }

    // 数据列表
    protected _dataList: any[] = []

    // 数据转换为节点的函数
    protected _dataToNode: (data: any , index: number) => Node = null

    // 设置数据列表
    protected setDataList<T>(dataList: T[]) {
        this._dataList = dataList;
    }

    // 设置数据转换为节点的函数
    protected setDataToNode<T>(dataToNode: (data: T , index: number) => Node) {
        this._dataToNode = dataToNode;
    }

    // 最大高度
    protected maxHeight: number = 0;

    // 渲染列表
    protected renderList() {
        // 获取容器节点宽高
        if (!this._contentSize) {
            const uiTransform = this.content.getComponent(UITransform)
            this._contentSize = new Size(uiTransform.width , uiTransform.height)
        }
        // 遍历渲染
        let spaceY = 0 , spaceX = 0 , currentMaxHeight = 0 , hasEnterRenderArea = false , completeRender = true
        this.content.removeAllChildren()
        for (let index = 0; index < this._dataList.length; index++) {
            const data = this._dataList[index];
            const node = this._dataToNode(data , index)
            const uiTransform = node.getComponent(UITransform)
            currentMaxHeight = Math.max(currentMaxHeight , uiTransform.height)
            // 判断是否满足换行
            if (spaceX + uiTransform.width > this._contentSize.width) {
                spaceX = 0
                spaceY += currentMaxHeight + this.spaceY
                currentMaxHeight = 0
            }
            // 判断是否在渲染范围内
            if (spaceY - this.scrollTop < this.contentSize.height && spaceY - this.scrollTop + uiTransform.height > 0) {
                // 到达渲染范围
                hasEnterRenderArea = true
                // 渲染节点
                node.setPosition(
                    spaceX + uiTransform.width / 2 - this._contentSize.width / 2 ,
                    -(spaceY - this.scrollTop + uiTransform.height / 2 - this._contentSize.height / 2)
                )
                this.content.addChild(node)
            } 
            // 不在渲染范围
            else {
                // 已经经过需要渲染的区域后离开则后续不需要继续进行
                if (hasEnterRenderArea) {
                    completeRender = false
                    break
                }
            }
            // 添加行
            spaceX += uiTransform.width + this.spaceX
        }
        // 是否全部都进行了渲染
        if (completeRender) {
            // 更新最大高度
            this.maxHeight = spaceY + currentMaxHeight
        }
    }

    // 启动列表
    public startVirtualList<T>(dataList: T[], dataToNode: (data: T , index: number) => Node) {
        // 设置数据列表
        this.setDataList(dataList);
        // 设置数据转换为节点的函数
        this.setDataToNode(dataToNode);
        // 渲染列表
        this.renderList();
        // 绑定滚动事件
        this.content.on(Node.EventType.TOUCH_START , () => this.content.on(Node.EventType.TOUCH_MOVE , this.scrollHandler , this))
        this.content.on(Node.EventType.TOUCH_END , () => this.content.off(Node.EventType.TOUCH_MOVE , this.scrollHandler , this))
        this.content.on(Node.EventType.TOUCH_CANCEL , () => this.content.off(Node.EventType.TOUCH_MOVE , this.scrollHandler , this))
    }

    // 防抖渲染
    protected hasAwaitRender: boolean = false

    // 滚动回调
    protected scrollHandler(e: EventTouch) {
        if (this._scrollTop < -5) return this._scrollTop = -5
        if (this.maxHeight !== 0) {
            if (this.maxHeight < this.contentSize.height) return this._scrollTop = 0
            if (this.maxHeight - this.contentSize.height + 5 < this.scrollTop)
                return this._scrollTop = this.maxHeight - this.contentSize.height + 5
        }
        this._scrollTop += e.getDeltaY()
        if (this.hasAwaitRender) return
        this.hasAwaitRender = true
        this.setAutoInterval(() => {
            this.renderList()
            this.hasAwaitRender = false
        } , {count: 1 , timer: 15})
    }

}
