export type LoadingOption = {
    // 加载一步
    stage?: (current: number , max: number) => any
    // 加载完成
    loaded?: () => any
}

export class LoadingManager {

    protected static hasExcute: boolean = false

    protected static loadingQueue: (() => Promise<void>)[] =[]

    public static get maxQueue() { return this.loadingQueue.length }

    // 添加加载回调
    public static async addLoadingQueue(callback: (() => Promise<void>)) {
        this.loadingQueue.push(callback)
    }

    // 执行加载回调
    public static async excuteLoadingQueue(loadingOption: LoadingOption = {}) {
        if (this.hasExcute) return 
        this.hasExcute = true
        for (let i = 0; i < this.loadingQueue.length; i++) {
            const callback = this.loadingQueue[i];
            await callback()
            loadingOption.stage && await loadingOption.stage(i + 1 , this.loadingQueue.length)
        }
        return new Promise(res => {
            setTimeout(async () => {
                loadingOption.loaded && await loadingOption.loaded()
                res(void 0)
            })
            return
        })
    }

}