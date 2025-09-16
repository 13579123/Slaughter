import { Constructor, log } from "cc";
import { SkillPrototype } from "../../System/Core/Prototype/SkillPrototype";

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

    // 递归寻找子节点
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
// 玩家技能表
const PlayerSkillTable = new Map<string , Array<string>>()

// 注册到玩家技能表
export const RegisterPlayerSkill: PlayerSkillClassDecorator = (key: string , player: string , parent?: string) => {
    return (T) => {
        // 寻找parent
        const root = PlayerSkillRoot.get(player)
        let parentNode = root ? root.findChildByKey(parent) : null
        // 创建node
        const node = new SkillNode( 
            key , T as unknown as Constructor<SkillPrototype> , [] , 
            player , parentNode ? parentNode.floor + 1 : 0 , parentNode 
        )
        // 添加到父节点
        if (!parentNode) PlayerSkillRoot.set(player , node)
        else parentNode.children.push(node)
        // 添加到玩家技能表
        const skills = PlayerSkillTable.get(player) || []
        skills.push(key)
        PlayerSkillTable.set(player , skills)
    }
}

// 获取玩家技能树根节点
export function getPlayerSkillRootNode(player: string): SkillNode {
    return PlayerSkillRoot.get(player)
}

// 判断技能是否属于某个角色
export function isSkillBelongToPlayer(skill: string , player: string): boolean {
    return PlayerSkillTable.get(player)?.indexOf(skill) !== -1
}


// 技能升级需要的材料
type SkillUpLevelClassDecorator = (
    key: string,
    getCallback: (level: number) => {gold: number , diamond: number}
) => ClassDecorator

const SkillUpLevelConfig = new Map<string , (level: number) => {gold: number , diamond: number}>()

export const RegisterSkillUpLevel: SkillUpLevelClassDecorator = (
    key: string,
    getCallback: (level: number) => {gold: number , diamond: number}
) => {
    return (T: any) => {
        SkillUpLevelConfig.set(key , getCallback)
    }
}

export function getSkillUpLevelMaterial(key: string , level: number): {gold: number , diamond: number} {
    return SkillUpLevelConfig.get(key)?.(level) || {gold: 0 , diamond: 0}
}