import { Constructor, log } from "cc";
import { SkillPrototype } from "../../System/Core/Prototype/SkillPrototype";
import { extend } from "../../Module/Rx/shared";

// k 技能key player 玩家key parent 父节点key
type PlayerSkillClassDecorator = (k: string , player: string , parent?: string) => ClassDecorator

class SkillNode {
    public constructor(
        public readonly key: string, // 技能key
        public readonly SkillPrototype: Constructor<SkillPrototype>, // 技能原型
        public readonly children: SkillNode[], // 子节点
        public readonly player: string, // 所属玩家
        public readonly floor: number, // 层数
        public readonly parent: SkillNode, // 父节点
    ) {
    }

    public findChildByKey(key: string): SkillNode {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (child.key === key) {
                return child
            }
            let r = child.findChildByKey(key)
            if (r) return r
        }
        return null
    }

}

// 所有玩家技能根节点
const PlayerSkillRoot = new Map<string , SkillNode>()

// 注册到玩家技能表
export const RegisterPlayerSkill: PlayerSkillClassDecorator = (key: string , player: string , parent?: string) => {
    return (T) => {
        // 寻找parent
        const findParent = (node: SkillNode) => {
            if (!node) return null
            return node.findChildByKey(parent)
        }
        let parentNode = findParent(PlayerSkillRoot.get(player))
        const node = new SkillNode( 
            key , T as unknown as Constructor<SkillPrototype> , [] , 
            player , parentNode ? parentNode.floor + 1 : 0 , parentNode 
        )
        if (!parentNode) PlayerSkillRoot.set(player , node)
        else parentNode.children.push(node)
    }
}