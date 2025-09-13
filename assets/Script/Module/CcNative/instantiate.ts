import { instantiate as instantiatePrefab, Prefab, Node } from 'cc'

const nodeCache: WeakMap<Prefab, Node[]> = new WeakMap()

// 实例化预制体
export function instantiate(prefab: Prefab): Node {
  let result = null, nodes = nodeCache.get(prefab)
  if (!nodes) {
    nodes = []
    nodeCache.set(prefab, nodes)
  }
  if (!(result = nodes.pop())) {
    // 扩容
    result = instantiatePrefab(prefab)
    setTimeout(() => nodes.push(instantiatePrefab(prefab)));
  }
  return result
}