import { CcNative } from "../../Module/CcNative";
import { CcAssetManager } from "../../Module/CcNative/Asset/AssetManager";

let baseModManager: CcAssetManager = null

export function getBaseModManager() {
    if (baseModManager) return baseModManager;
    return baseModManager = new CcNative.Asset.AssetManager("ModBaseResource");
}