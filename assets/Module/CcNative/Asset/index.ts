import { CcAssetManager } from "./AssetManager";
import { loadRemote } from "./RemoteAsset";

export const Asset = {
    // 远程资源
    loadRemote,
    // 资源管理
    AssetManager: CcAssetManager,
}