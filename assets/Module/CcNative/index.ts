import { Asset } from "./Asset";
import { instantiate } from "./instantiate";
import { Storage } from "./Storage";

export const CcNative = {
  
  // 负责本地存储相关
  Storage,

  // 资源管理
  Asset,

  // 实例化prefab
  instantiate,
  
}