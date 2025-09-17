import { Asset, AssetManager, Node, assert, assetManager, find, log } from "cc";

// 资源缓存
const CACHE_RESOURCE = new Map<string, AssetPack<any> | AssetPack<any>[]>()

// 资源上一次使用时间
const RESOURCE_LAST_TIME = new Map<string, number>()

// bundle管理
const ASSETS_MANAGER_MAP = new Map<string, AssetManager.Bundle>()

// 用于合并多次加载的相同资源
const AWAIT_LOAD_RESOURCE = new Map<string, Promise<any>>()

// 资源管理类
export class CcAssetManager {

  // bundle
  protected bundle: AssetManager.Bundle

  // 所有等待成功的函数
  protected awaitResolveFunc: Function[] = []

  // 构造器
  constructor(public readonly bundleName: string) {
    // 是否有缓存
    if (this.bundle = ASSETS_MANAGER_MAP.get(bundleName)) return
    assetManager.loadBundle(bundleName, (err, b) => {
      if (err) {
        console.log(bundleName)
        console.error(err)
        return
      }
      this.bundle = b
      ASSETS_MANAGER_MAP.set(bundleName, this.bundle)
      // 清空等待数组
      this.awaitResolveFunc.forEach(c => c())
      this.awaitResolveFunc.length = 0
    })
  }

  // 加载
  public async load<T extends Asset>(path: string, type?: new (...v: any) => T, cache: boolean = false): Promise<AssetPack<T> | null> {
    if (!this.bundle) { await new Promise(res => this.awaitResolveFunc.push(res)) }
    const cachePath = this.bundleName + "/" + path
    RESOURCE_LAST_TIME.set(cachePath, Date.now())
    if (AWAIT_LOAD_RESOURCE.get(cachePath)) 
      return AWAIT_LOAD_RESOURCE.get(cachePath) as Promise<AssetPack<T> | null>
    if (CACHE_RESOURCE.get(cachePath)) 
      return CACHE_RESOURCE.get(cachePath) as AssetPack<T>
    const promise = new Promise<AssetPack<T> | null>(async (res, rej) => {
      this.bundle.load(path, type as any, (err, data) => {
        AWAIT_LOAD_RESOURCE.delete(cachePath)
        if (err) { return rej(err) }
        const assetPack = new AssetPack<T>(data as T , cachePath)
        res(assetPack)
        if (cache) CACHE_RESOURCE.set(cachePath, assetPack)
      })
    })
    AWAIT_LOAD_RESOURCE.set(cachePath, promise)
    return promise
  }

  // 加载文件夹
  public async loadDir<T extends Asset>(path: string, type?: new (...v: any) => T, cache: boolean = false): Promise<AssetPack<T>[] | null> {
    if (!this.bundle) { await new Promise(res => this.awaitResolveFunc.push(res)) }
    const cachePath = this.bundleName + "/" + path
    RESOURCE_LAST_TIME.set(cachePath, Date.now())
    if (AWAIT_LOAD_RESOURCE.get(cachePath)) 
      return AWAIT_LOAD_RESOURCE.get(cachePath) as Promise<AssetPack<T>[] | null>
    if (CACHE_RESOURCE.get(cachePath)) 
      return CACHE_RESOURCE.get(cachePath) as AssetPack<T>[]
    const promise = new Promise<AssetPack<T>[] | null>(async (res, rej) => {
      this.bundle.loadDir(path, type as any, (err, data) => {
        AWAIT_LOAD_RESOURCE.delete(cachePath)
        if (err) { return rej(err) }
        const arr: AssetPack<T>[] = []
        for (let i = 0; i < data.length; i++) {
          const asset = data[i]
          arr.push(new AssetPack(asset as T , cachePath))
        }
        res(arr)
        if (cache) CACHE_RESOURCE.set(cachePath, arr)
      })
    })
    AWAIT_LOAD_RESOURCE.set(cachePath, promise)
    return promise
  }

}

export class AssetPack<T extends Asset> {

  constructor(
    protected readonly asset: T ,
    protected cachePath: string,
  ) {}

  public get value(): T {
    return this.asset
  }
  public addRef() {
    this.asset.addRef()
  }

  public decRef() {
    this.asset.decRef()
    if (this.asset.refCount === 0) {
      CACHE_RESOURCE.delete(this.cachePath)
    }
  }

}
