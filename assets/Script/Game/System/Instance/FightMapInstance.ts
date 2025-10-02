import { Constructor, SpriteFrame } from "cc";
import { FightMapPrototype, MonsterDTO } from "../Prototype/FightMapPrototype";
import { CharacterInstance } from "../../../System/Core/Instance/CharacterInstance";
import { Rx } from "db://assets/Module/Rx";
import { createPlayerInstance } from "../../Share";
import { getCharacterPrototype } from "../../../System/Manager/CharacterManager";
import { CharacterDTO } from "../../../System/Core/Prototype/CharacterPrototype";

export enum MapData {
    Wall = 0,
    Floor = 1,
    Treasure = 2,
}

export type MonsterData = {
    character: CharacterInstance,
    position: { x: number, y: number }
    isBoss: boolean,
    dto: MonsterDTO
}

export type TreasureData = {
    position: { x: number, y: number }
}

export class FightMapInstance {

    public proto: FightMapPrototype;

    // 玩家数据
    public player: CharacterInstance = null

    // 玩家位置
    public playerPosition: { x: number, y: number } = { x: 1, y: 1 }

    // 地图数据
    public mapData: MapData[][] = []

    // 所有空位置
    public emptyPosition: { x: number, y: number }[] = []

    // 怪物数据
    public monsterData: MonsterData[] = []

    // 宝箱数据
    public treasureData: TreasureData[] = []

    // 构造器
    constructor(Proto: Constructor<FightMapPrototype>) {
        this.proto = new Proto(this);
        this.player = Rx.reactive(createPlayerInstance())
        this.initMapData()
        this.initMonster()
    }

    // 初始化怪物
    protected initMonster() {
        const countArea = this.proto.monsterCount
        const count = Math.floor(Math.random() * countArea[0]) + (countArea[1] - countArea[0])
        // 随机怪物
        for (let i = 0; i < count; i++) {
            // 随机获得一个空位置
            const emptyIndex = Math.floor(Math.random() * this.emptyPosition.length)
            if (!emptyIndex) break
            // 移除空位置
            const pos = this.emptyPosition[emptyIndex]
            this.emptyPosition.splice(emptyIndex, 1)
            // 随机获得怪物
            const monsterDtos = this.proto.monsterData.monsters
            if (pos) {
                const monsterDTO = monsterDtos[Math.floor(Math.random() * monsterDtos.length)]
                if (monsterDTO) {
                    this.monsterData.push({
                        position: pos,
                        dto: monsterDTO,
                        isBoss: false,
                        character: new CharacterInstance({
                            lv: monsterDTO.dto.lv || 1,
                            buffs: monsterDTO.dto.buffs || [],
                            skills: monsterDTO.dto.skills || [],
                            equipments: monsterDTO.dto.equipments || {},
                            extraProperty: monsterDTO.dto.extraProperty || {},
                            Proto: getCharacterPrototype(monsterDTO.dto.prototype)
                        })
                    })
                }
            }
        }
        // 随机boss
        const boss = this.proto.monsterData.boss[Math.floor(Math.random() * this.proto.monsterData.boss.length)]
        const emptyIndex = Math.floor(Math.random() * this.emptyPosition.length)
        if (!emptyIndex) return
        // 移除空位置
        const pos = this.emptyPosition[emptyIndex]
        this.emptyPosition.splice(emptyIndex, 1)
        if (boss) {
            this.monsterData.push({
                position: pos,
                dto: boss,
                isBoss: true,
                character: new CharacterInstance({
                    lv: boss.dto.lv || 1,
                    buffs: boss.dto.buffs || [],
                    skills: boss.dto.skills || [],
                    equipments: boss.dto.equipments || {},
                    extraProperty: boss.dto.extraProperty || {},
                    Proto: getCharacterPrototype(boss.dto.prototype)
                })
            })
        }
        // 随机宝箱
        const treasureCount = Math.floor(Math.random() * this.proto.treasureCount[0]) + 
            (this.proto.treasureCount[1] - this.proto.treasureCount[0])
        for (let i = 0; i < treasureCount ; i++) {
            // 随机获得一个空位置
            const emptyIndex = Math.floor(Math.random() * this.emptyPosition.length)
            if (!emptyIndex) break
            // 移除空位置
            const pos = this.emptyPosition[emptyIndex]
            this.emptyPosition.splice(emptyIndex, 1)
            if (pos) {
                this.treasureData.push({position: pos})
            }
        }
        // const emptyIndex = Math.floor(Math.random() * this.emptyPosition.length)
        return
    }

    // 初始化地图数据
    protected initMapData() {
        // 初始化全是墙
        const notEnterRoomMap = new Set<string>()
        const hasGoButHasNotEnterRoomMap = new Set<string>()
        const size = this.proto.size
        // 初始化为基础地图
        const sizey = size.y % 2 === 0 ? size.y + 1 : size.y
        const sizex = size.x % 2 === 0 ? size.x + 1 : size.x
        for (let i = 0; i < sizey; i++) {
            const list = []
            for (let j = 0; j < sizex; j++) {
                if ((i - 1) % 2 === 0 && (j - 1) % 2 === 0 && i !== size.x - 1 && j !== size.y - 1) {
                    list.push(MapData.Floor)
                    notEnterRoomMap.add(`${j} ${i}`)
                }
                else
                    list.push(MapData.Wall)
            }
            this.mapData.push(list)
        }
        // 随机生成地图 砸墙算法
        let posx = 1, posy = 1
        while (notEnterRoomMap.size > 0) {
            // 房间已经进入
            notEnterRoomMap.delete(`${posx} ${posy}`)
            this.emptyPosition.push({ x: posx, y: posy })
            // 可以走的方向
            const direct: { x: number, y: number, wallX: number, wallY: number }[] = []
            if (posx - 2 > 0 && notEnterRoomMap.has(`${posx - 2} ${posy}`))
                direct.push({ x: posx - 2, y: posy, wallX: posx - 1, wallY: posy })
            if (posx + 2 < sizex - 1 && notEnterRoomMap.has(`${posx + 2} ${posy}`))
                direct.push({ x: posx + 2, y: posy, wallX: posx + 1, wallY: posy })
            if (posy - 2 > 0 && notEnterRoomMap.has(`${posx} ${posy - 2}`))
                direct.push({ x: posx, y: posy - 2, wallX: posx, wallY: posy - 1 })
            if (posy + 2 < sizey - 1 && notEnterRoomMap.has(`${posx} ${posy + 2}`))
                direct.push({ x: posx, y: posy + 2, wallX: posx, wallY: posy + 1 })
            // 如果没有则随机找一个进入过但是还有没有打通房间的房间
            if (direct.length === 0) {
                const keys = Array.from(hasGoButHasNotEnterRoomMap.keys())
                const key = keys[Math.floor(Math.random() * keys.length)]
                const [x, y] = key.split(" ")
                posx = Number(x)
                posy = Number(y)
                continue
            }
            // 随机选择一个方向
            const directIndex = Math.floor(Math.random() * direct.length)
            const nextPos = direct[directIndex]
            direct.splice(directIndex, 1)
            if (direct.length > 0) hasGoButHasNotEnterRoomMap.add(`${posx} ${posy}`)
            else hasGoButHasNotEnterRoomMap.delete(`${posx} ${posy}`)
            posx = nextPos.x
            posy = nextPos.y
            this.mapData[nextPos.wallY][nextPos.wallX] = MapData.Floor
            this.emptyPosition.push({ x: nextPos.wallX, y: nextPos.wallY })
        }
        return
    }

    // 移除怪物
    public removeMonster(pos: { x: number, y: number }) {
        for (let i = 0; i < this.monsterData.length; i++) {
            const monsterData = this.monsterData[i];
            if (monsterData.position.x === pos.x && monsterData.position.y === pos.y) {
                this.monsterData.splice(i, 1)
                // 添加到空位置
                this.emptyPosition.push(monsterData.position)
                break
            }
        }
    }

    // 寻路算法
    public findPath(from: { x: number, y: number }, to: { x: number, y: number }): ("up" | "down" | "left" | "right")[] {
        const result = []
        const xCha = to.x - from.x
        const yCha = to.y - from.y
        if (xCha > 0) {
            for (let i = 0; i < xCha; i++) result.push("right")
        } else if (xCha < 0) {
            for (let i = 0; i < Math.abs(xCha); i++) result.push("left")
        }
        if (yCha > 0) {
            for (let i = 0; i < yCha; i++) result.push("down")
        } else if (yCha < 0) {
            for (let i = 0; i < Math.abs(yCha); i++) result.push("up")
        }
        return result
    }

}