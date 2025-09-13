import { Asset, ImageAsset, assetManager } from "cc";

const REMOTE_MAP = new Map<string , RemoteAssetPack<Asset>>()

type Options = { [k: string]: any; ext?: string; cache?: boolean;}

export async function loadRemote<T extends Asset>(path: string, options: Options = null): Promise<RemoteAssetPack<T>> {
  if (REMOTE_MAP.get(path)) return REMOTE_MAP.get(path) as RemoteAssetPack<T>
  return new Promise(res => {
    assetManager.loadRemote(path, options, (err, asset) => {
      if (err) throw err
      let assetPack: RemoteAssetPack<T> = new RemoteAssetPack<T>(asset as T , path)
      if (options.cache) REMOTE_MAP.set(path, assetPack)
      res(assetPack)
    })
  })
}

export class RemoteAssetPack<T extends Asset> {

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
      REMOTE_MAP.delete(this.cachePath)
    }
  }

}