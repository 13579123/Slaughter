import { Constructor } from "cc"
import { CcNative } from "../Module/CcNative"
import { Rx } from "../Module/Rx"

export type ManagerOption<T> = {
    // 是否加密
    descrypt?: boolean,
    // 存储键
    storageKey: string,
    // 构造器
    Constructor: Constructor<T>,
    // 数据转换构造器
    DtoCostructor: Constructor<any>,
}

export class Manager<T> {

    protected _data: T

    public get data(): T {
        if (this._data) return this._data
        this.update()
        return this._data
    }

    constructor(protected readonly option: ManagerOption<T>) {
        this.option = option
    }

    public save() {
        const dto = new this.option.DtoCostructor(this.data)
        CcNative.Storage.set(
            this.option.storageKey || "" , 
            dto , 
            this.option.descrypt
        )
    }

    public update() {
        const dto = CcNative.Storage.get(this.option.storageKey)
        this._data = Rx.reactive(new this.option.Constructor(dto))
    }

}

export class BaseEventManagerData<T> {
    
    protected eventMap = new Map<T , Array<Function>>()
    public on(e: T , callback: (num: number) => void) {
        if (!this.eventMap.has(e)) {
            this.eventMap.set(e , [])
        }
        this.eventMap.get(e)!.push(callback)
    }
    public off(e: T , callback?: (num: number) => void) {
        if (!this.eventMap.has(e)) return
        if (callback) this.eventMap.set(e , this.eventMap.get(e).filter((cb) => cb !== callback) )
        else this.eventMap.set(e , [])
    }
    public emit(e: T , ...rest: any) {
        if (!this.eventMap.has(e)) return
        this.eventMap.get(e)!.forEach((cb) => cb(...rest))
    }
    
}