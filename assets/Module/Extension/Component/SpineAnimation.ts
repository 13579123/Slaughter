import { _decorator, Component, error, Node, sp } from 'cc';
const { ccclass, property } = _decorator;

export type AnimationOption = {
    speed?: number; // 动画播放速度
    count?: number; // 动画播放次数，-1为无限循环
}

@ccclass('SpineAnimation')
export class SpineAnimation extends sp.Skeleton {

    // 播放动画
    // name 动画名称 count 动画播放次数
    public playAnimation(name: string, option: AnimationOption = {}): Promise<void> {
        let count = option.count || -1
        let speed = option.speed || 1
        this.timeScale = speed
        return new Promise(res => {
            this.clearAnimation(0)
            this.addAnimation(0, name, count === 1 ? false : true)
            this.setCompleteListener(() => {
                if (count === -1) return
                if (count > 0) count--
                if (count === 0) return res()
            })
        })
    }

    // 挂点
    public setSocket(socketPath: string, node: Node): void {
        if (!node || node.parent) { return error("node is not exit or is already have a parent") }
        this.node.addChild(node)
        const socket = new sp.SpineSocket(socketPath, node)
        this.sockets.push(socket)
        this.sockets = this.sockets
    }

    // 移除挂点
    public removeSocket(socketPath: string, node?: Node): void {
        if (!node) {
            const sockets = this.sockets.filter(socket => socket.path !== socketPath)
            this.sockets = sockets
        } else {
            const sockets = this.sockets.filter(socket => (socket.path !== socketPath) && (socket.target !== node))
            this.sockets = sockets
            node.parent = null
        }
    }

    // 是否已经开启帧时间监听
    protected hasOpenFrameEvent: boolean = false

    // 帧事件列表
    protected frameEventMap: Map<string , Set<Function>> = new Map

    // 监听帧事件
    public listenFrameEvent(event: string , callback: (e: sp.spine.Event) => any) {
        if (!this.hasOpenFrameEvent) {
            this.setEventListener((_, e: sp.spine.Event) => {
                this.frameEventMap.get(e.data.name)?.forEach(c => c(e))
            })
            this.hasOpenFrameEvent = true
        }
        let arr = this.frameEventMap.get(event)
        if (!arr) this.frameEventMap.set(event , arr = new Set)
        arr.add(callback)
    }

    // 移除帧事件
    public removeFrameEvent(event: string , callback?: (e: sp.spine.Event) => any) {
        if (!callback) this.frameEventMap.delete(event)
        const set = this.frameEventMap.get(event)
        if (set) set.delete(callback)
        if (set && set.size <= 0) this.frameEventMap.delete(event)
    }

}