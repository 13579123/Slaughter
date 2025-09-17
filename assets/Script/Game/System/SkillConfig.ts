import { Constructor, log } from "cc";
import { SkillPrototype } from "../../System/Core/Prototype/SkillPrototype";

// k 技能key player 玩家key parent 父节点key
type PlayerSkillClassDecorator = (k: string , player: string , parent?: string) => ClassDecorator

export class SkillNode {
    public constructor(
        public readonly key: string, // 技能key
        public readonly SkillPrototype: Constructor<SkillPrototype>, // 技能原型
        public readonly children: SkillNode[], // 子节点
        public readonly player: string, // 所属玩家
        public readonly floor: number, // 层数
        public readonly parent: SkillNode, // 父节点
    ) {
    }

}


// 等待添加的回调
const WaitAddNode = new Set<() => boolean>()
// 所有玩家技能根节点
const PlayerSkillRoot = new Map<string , SkillNode[]>()
// 玩家技能表
const PlayerSkillTable = new Map<string , Array<SkillNode>>()
// 玩家技能树每一层的技能数量
const PlayerSkillTreeFloor = new Map<string , Array<number>>()

// 注册到玩家技能表
export const RegisterPlayerSkill: PlayerSkillClassDecorator = (key: string , player: string , parent?: string) => {
    return (T: any) => {
        const playerSkillTreeFloor = PlayerSkillTreeFloor.get(player) || []
        PlayerSkillTreeFloor.set(player , playerSkillTreeFloor)
        // 注册为子技能
        const registerToChild = () => {
            const skillList = PlayerSkillTable.get(player) || []
            for (let i = 0; i < skillList.length; i++) {
                const skillNode = skillList[i];
                if (skillNode.key === parent) {
                    const node = new SkillNode(key , T , [] , player , skillNode.floor + 1 , skillNode)
                    skillNode.children.push(node)
                    const skillTable = PlayerSkillTable.get(player) || []
                    PlayerSkillTable.set(player , skillTable)
                    skillTable.push(node)
                    playerSkillTreeFloor[skillNode.floor + 1] = (playerSkillTreeFloor[skillNode.floor + 1] || 0) + 1
                    foreach()
                    return true
                }
            }
            return false
        }
        const foreach = () => new Set(WaitAddNode).forEach(c => {
            if (c()) WaitAddNode.delete(c)
        })
        // 注册为根技能
        if (!parent) {
            const roots = PlayerSkillRoot.get(player) || []
            PlayerSkillRoot.set(player , roots)
            const node = new SkillNode(key , T , [] , player , 0 , null)
            roots.push(node)
            const skillTable = PlayerSkillTable.get(player) || []
            PlayerSkillTable.set(player , skillTable)
            skillTable.push(node)
            playerSkillTreeFloor[0] = (playerSkillTreeFloor[0] || 0) + 1
            foreach()
            return
        } 
        // 添加失败，等待添加，每次添加一个技能则尝试再次添加
        if (!registerToChild()) WaitAddNode.add(registerToChild) 
    }
}

// 获取玩家技能树根节点
export function getPlayerSkillRootsNode(player: string): SkillNode[] {
    return PlayerSkillRoot.get(player) || []
}

// 判断技能是否属于某个角色
export function isSkillBelongToPlayer(skill: string , player: string): boolean {
    const skills = PlayerSkillTable.get(player)
    let result = false
    for (let i = 0; i < skills.length; i++) {
        const s = skills[i];
        if (skill === s.key) return true
    }
    return result
}

// 获取玩家技能树层级
export function getPlayerSkillTreeFloor(player: string): number[] {
    return PlayerSkillTreeFloor.get(player) || []
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