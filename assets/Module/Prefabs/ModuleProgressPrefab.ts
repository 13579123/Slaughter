import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

type ProgressEvent = "update"|"complete"

@ccclass('ModuleProgressPrefab')
export class ModuleProgressPrefab extends Component {

    @property(Node)
    protected ProgressTub: Node = null;

    @property(Node)
    protected ProgressWhiteTub: Node = null;

    protected progressMaxWidth: number = 0;

    protected _progress: number = 0

    public get progress() { return this._progress }

    protected onLoad(): void {
        // 获取进度条最大值
        this.progressMaxWidth = this.node.getChildByName("loading-mask").getComponent(UITransform).width
        const normalPos = this._progress * this.progressMaxWidth - this.progressMaxWidth
        this.ProgressWhiteTub.setPosition( normalPos , this.ProgressTub.position.y )
        this.ProgressTub.setPosition( normalPos , this.ProgressTub.position.y )
    }

    // 设置进度条
    public setProgress(progress: number, force: boolean = false) {
        const normalPos = progress * this.progressMaxWidth - this.progressMaxWidth
        if (force) {
            this.ProgressWhiteTub.setPosition( normalPos , this.ProgressTub.position.y )
            this.ProgressTub.setPosition( normalPos , this.ProgressTub.position.y )
        } else {
            if (progress > this.progress) this.ProgressWhiteTub.setPosition( normalPos , this.ProgressTub.position.y )
            else if(progress < this.progress) this.ProgressTub.setPosition( normalPos , this.ProgressTub.position.y )
        }
        this._progress = progress
    }

    // 是否在动画中
    protected isAnimationing = false
    // 每一帧自动校准
    protected update(dt: number): void {
        const normalPos = this.progress * this.progressMaxWidth - this.progressMaxWidth

        const speed = Math.max(
            Math.abs((this.ProgressTub.position.x) - normalPos) * 2 * this.progressMaxWidth * 0.002,
            Math.abs((this.ProgressWhiteTub.position.x) - normalPos) * 2 * this.progressMaxWidth * 0.002,
        )

        if (this.ProgressWhiteTub.position.x !== normalPos || this.ProgressTub.position.x !== normalPos) this.isAnimationing = true

        if (this.ProgressWhiteTub.position.x === normalPos && this.ProgressTub.position.x === normalPos && this.isAnimationing) {
            this.isAnimationing = false
            this.emit("complete")
        }

        if ((this.ProgressWhiteTub.position.x) === normalPos) {
        }
        else if (Math.abs((this.ProgressWhiteTub.position.x) - normalPos) <= this.progressMaxWidth * 0.02) {
            this.ProgressWhiteTub.setPosition(normalPos, this.ProgressTub.position.y)
            const progress = (this.progressMaxWidth + this.ProgressWhiteTub.position.x) / this.progressMaxWidth
            this.emit("update" , progress)
        }
        else if (Math.abs((this.ProgressWhiteTub.position.x) - normalPos) > this.progressMaxWidth) {
            this.ProgressWhiteTub.setPosition(normalPos, this.ProgressTub.position.y)
            const progress = (this.progressMaxWidth + this.ProgressWhiteTub.position.x) / this.progressMaxWidth
            this.emit("update" , progress)
        }
        else {
            this.ProgressWhiteTub.setPosition(this.ProgressWhiteTub.position.x - dt * speed, this.ProgressTub.position.y)
            const progress = (this.progressMaxWidth + this.ProgressWhiteTub.position.x) / this.progressMaxWidth
            this.emit("update" , progress)
        }

        if ((this.ProgressTub.position.x) === normalPos) { 
        }
        else if (Math.abs((this.ProgressTub.position.x) - normalPos) <= this.progressMaxWidth * 0.02) {
            this.ProgressTub.setPosition(normalPos, this.ProgressTub.position.y)
            const progress = (this.progressMaxWidth + this.ProgressTub.position.x) / this.progressMaxWidth
            this.emit("update" , progress)
        }
        else if (Math.abs((this.ProgressTub.position.x) - normalPos) > this.progressMaxWidth) {
            this.ProgressTub.setPosition(normalPos, this.ProgressTub.position.y)
            const progress = (this.progressMaxWidth + this.ProgressTub.position.x) / this.progressMaxWidth
            this.emit("update" , progress)
        }
        else {
            this.ProgressTub.setPosition(this.ProgressTub.position.x + dt * speed, this.ProgressTub.position.y) 
            const progress = (this.progressMaxWidth + this.ProgressTub.position.x) / this.progressMaxWidth
            this.emit("update" , progress)
        }
    }

    protected eventMap = new Map<string , Set<Function>>()

    protected emit(event: ProgressEvent , ...arg: any) {
        let set = this.eventMap.get(event)
        if (set) {
            set.forEach(c => c(...arg))
        }
    }

    public on(event: ProgressEvent , callback: Function) {
        let set = this.eventMap.get(event)
        if (!set) this.eventMap.set(event , set = new Set)
        set.add(callback)
    }

    public off(event: ProgressEvent , callback?: Function) {
        let set = this.eventMap.get(event)
        if (!set) return
        if (!callback) return set.clear()
        set.delete(callback)
    }

}
function menu(arg0: string): (target: typeof ModuleProgressPrefab) => void | typeof ModuleProgressPrefab {
    throw new Error('Function not implemented.');
}

