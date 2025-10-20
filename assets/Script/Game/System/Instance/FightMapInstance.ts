import { Constructor, SpriteFrame, v2, Vec2 } from "cc";
import { FightMapPrototype, MonsterDTO, ReinforcementDTO } from "../Prototype/FightMapPrototype";
import { CharacterInstance } from "../../../System/Core/Instance/CharacterInstance";
import { Rx } from "db://assets/Module/Rx";
import { createPlayerInstance } from "../../Share";
import { getCharacterPrototype } from "../../../System/Manager/CharacterManager";
import { CharacterDTO } from "../../../System/Core/Prototype/CharacterPrototype";
import { MapGenerator, RoomType } from "../../MapGenerated/MapGenerator";
import { CcNative } from "db://assets/Module/CcNative";
import { equipmentManager } from "../../Manager/EquipmentManager";
import { EnterFightMapOptions } from "../Manager/FightMapManager";
import { BasePrototypeProperty } from "../../../System/Core/Property/BasePrototypeProperty";

export enum MapData {
    None = 0,
    Floor = 1,
    Special = 2,
}

export type MonsterData = {
    character: CharacterInstance,
    position: Vec2,
    isBoss: boolean,
    dto: MonsterDTO
}

export type TreasureData = {
    position: Vec2, // 位置
    level: number, // 宝箱等级
    open: boolean // 是否开启
    openIcon: () => Promise<SpriteFrame> // 宝箱图标
    closeIcon: () => Promise<SpriteFrame> // 宝箱关闭图标
}

export type ObstcaleData = {
    position: Vec2
}

export type ReinforcecmentData = {
    position: Vec2,
    data: ReinforcementDTO
}

export class FightMapInstance {

    public proto: FightMapPrototype;

    // 玩家数据
    public player: CharacterInstance = null

    // 地图数据
    public mapData: MapData[][] = []

    // 玩家位置
    public playerPosition: Vec2 = v2(0, 0)

    // 终点位置
    public endPosition: Vec2 = v2(0, 0)

    // 未使用的空地位置 可以放置怪物和宝箱和障碍物
    public emptyPosition: Vec2[] = []

    // 房间数据
    public roomData: { pos: { x: number, y: number }, size: { width: number, height: number }, type: RoomType }[] = []

    // 怪物数据
    public monsterData: MonsterData[] = []

    // 宝箱数据
    public treasureData: TreasureData[] = []

    // 障碍物数据
    public obstacleData: ObstcaleData[] = []

    // 强化符文数据
    public reinforcementData: ReinforcecmentData[] = []

    // 配置详情
    public readonly fightOptions: EnterFightMapOptions = {}

    // 构造器
    constructor(Proto: Constructor<FightMapPrototype>, option: EnterFightMapOptions = {}) {
        this.fightOptions = option
        this.proto = new Proto(this);
    }

    // 创建玩家实例
    public createPlayerInstance(): CharacterInstance {
        let extraProperty: Partial<BasePrototypeProperty> = {}, instance: CharacterInstance = createPlayerInstance()
        if (this.fightOptions.playerExtraProperty) {
            extraProperty = this.fightOptions.playerExtraProperty
        }
        if (this.fightOptions.playerExtraPercentProperty) {
            Object.keys(this.fightOptions.playerExtraPercentProperty).forEach((property: keyof BasePrototypeProperty) => {
                if (typeof instance[property] === 'number') {
                    // @ts-ignore
                    extraProperty[property] = (this.fightOptions.playerExtraPercentProperty[property] as number + 1) * instance[property]
                }
            })
        }
        instance.extraProperty = extraProperty
        return instance
    }

    // 创建怪物实例
    public createMonsterInstance(dto: CharacterDTO): CharacterInstance {
        let extraProperty: Partial<BasePrototypeProperty> = {}, instance: CharacterInstance = new CharacterInstance({
            lv: dto.lv,
            buffs: dto.buffs,
            Proto: getCharacterPrototype(dto.prototype),
            // 装备信息
            equipments: dto.equipments,
            // 携带技能信息
            skills: dto.skills,
            // 额外数据
            extraProperty: dto.extraProperty
        })
        if (this.fightOptions.monsterExtraProperty) {
            Object.keys(this.fightOptions.monsterExtraProperty).forEach((property: keyof BasePrototypeProperty) => {
                if (typeof instance[property] === 'number') {
                    // @ts-ignore
                    extraProperty[property] = (extraProperty[property] || 0) + this.fightOptions.monsterExtraProperty[property]
                }
            })
        }
        if (this.fightOptions.monsterExtraPercentProperty) {
            Object.keys(this.fightOptions.monsterExtraPercentProperty).forEach((property: keyof BasePrototypeProperty) => {
                if (typeof instance[property] === 'number') {
                    // @ts-ignore
                    extraProperty[property] = instance[property] * (1 + this.fightOptions.monsterExtraPercentProperty[property])
                }
            })
        }
        instance.extraProperty = extraProperty
        return instance
    }

    // 是否初始化
    public init() {
        this.player = this.createPlayerInstance()
        if (this.proto.isBoss) {
            this.initBossMapData()
            this.initBossTreasure()
            this.initBossObstacle()
            this.initBossMonster()
            this.initBossReinforcement()
        }
        else {
            this.initMapData()
            this.initTreasure()
            this.initObstacle()
            this.initMonster()
            this.initReinforcement()
        }
    }

    // 初始化楼层数据
    protected initMapData() {
        // 尺寸 房间合集
        const mapGenerator = new MapGenerator()
        // 房间
        const roomMapData = mapGenerator.generateRandomRoom(this.proto.mapSize, this.roomData, 100)
        // 迷宫
        const mazeMapData = mapGenerator.generateRandomMaze(this.proto.mapSize)
        // 地图数据合并
        const mapData = []
        for (let i = 0; i < this.proto.mapSize.height; i++) {
            mapData.push([])
            for (let j = 0; j < this.proto.mapSize.width; j++)
                mapData[i].push(roomMapData[i][j] || mazeMapData[i][j])
        }
        // 消除死胡同
        this.mapData = mapGenerator.removeDeadEnd(mapData)
        // 添加空位置记录
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                if (this.mapData[y][x] === 1) this.addEmptyPosition(v2(x, y))
            }
        }
        // 随机选择房间作为起始坐标
        let startPos = this.emptyPosition[Math.floor(Math.random() * this.emptyPosition.length)]
        this.playerPosition.x = startPos.x
        this.playerPosition.y = startPos.y
        this.removeEmptyPosition(startPos)
        // 随机终点位置
        let endPos = this.emptyPosition[Math.floor(Math.random() * this.emptyPosition.length)]
        this.endPosition.x = endPos.x
        this.endPosition.y = endPos.y
        this.removeEmptyPosition(endPos)
    }

    // 初始化boos楼层
    protected initBossMapData() {
        const mapData = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
        this.mapData = mapData
        // 添加空位置
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                if (this.mapData[y][x] === 1) this.addEmptyPosition(v2(x, y))
            }
        }
        this.endPosition = v2(24, 7)
        this.playerPosition = v2(4, 7)
        this.removeEmptyPosition(this.endPosition)
        this.removeEmptyPosition(this.playerPosition)
    }

    // 初始化怪物
    protected initMonster() {
        const roomCount = this.roomData.length
        const count = Math.floor(Math.random() * roomCount * 2) + roomCount
        for (let i = 0; i < count; i++) {
            const monster = this.proto.monsterData.monsters()
            const pos = this.emptyPosition[Math.floor(Math.random() * this.emptyPosition.length)]
            if (!pos) break
            this.monsterData.push({
                dto: monster,
                position: pos,
                isBoss: false,
                character: this.createMonsterInstance(monster.dto)
            })
            this.removeEmptyPosition(pos)
        }
        return
    }

    // 初始化 Boss 怪物
    protected initBossMonster() {
        const monster = this.proto.monsterData.boss()
        this.monsterData.push({
            dto: monster,
            position: v2(18, 7),
            isBoss: true,
            character: this.createMonsterInstance(monster.dto)
        })
        this.removeEmptyPosition(v2(18, 7))
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

    // 初始化宝箱
    protected initTreasure() {
        const roomCount = this.roomData.length
        const count = Math.floor(Math.random() * roomCount / 2) + roomCount / 2
        for (let i = 0; i < count; i++) {
            const pos = this.emptyPosition[
                Math.floor(Math.random() * this.emptyPosition.length)
            ]
            if (!pos) break
            let level = 1
            if (Math.random() < 0.35) level = 2
            if (Math.random() < 0.10) level = 3
            this.treasureData.push({
                position: v2(pos.x, pos.y),
                level,
                open: false,
                // 宝箱图标
                openIcon: this.proto.treasureIcon.open[level - 1] || this.proto.treasureIcon.open[0],
                // 宝箱关闭图标
                closeIcon: this.proto.treasureIcon.close[level - 1] || this.proto.treasureIcon.close[0],
            })
            this.removeEmptyPosition(pos)
        }
        // 宝箱房间宝箱生成
        this.roomData.forEach((room, index) => {
            if (room.type === RoomType.TreasureRoom) {
                const posList = [
                    v2(Math.floor(room.pos.x + room.size.width / 2 - 1), Math.floor(room.pos.y + room.size.height / 2 - 1)),
                    v2(Math.floor(room.pos.x + room.size.width / 2 + 1), Math.floor(room.pos.y + room.size.height / 2 - 1)),
                    v2(Math.floor(room.pos.x + room.size.width / 2 - 1), Math.floor(room.pos.y + room.size.height / 2 + 1)),
                    v2(Math.floor(room.pos.x + room.size.width / 2 + 1), Math.floor(room.pos.y + room.size.height / 2 + 1)),
                ]
                posList.forEach(pos => {
                    if (this.mapData[pos.y] && this.mapData[pos.y][pos.x] !== MapData.Special) return
                    this.treasureData.push({
                        level: 3, open: false, position: v2(pos.x, pos.y),
                        openIcon: this.proto.treasureIcon.open[3 - 1] || this.proto.treasureIcon.open[0],
                        closeIcon: this.proto.treasureIcon.close[3 - 1] || this.proto.treasureIcon.close[0],
                    })
                })
                return
            }
            return
        })
        return
    }

    // 初始化Boss宝箱
    protected initBossTreasure() {
        const treasureData = {
            position: v2(20, 6),
            level: 3,
            open: false,
            // 宝箱图标
            openIcon: this.proto.treasureIcon.open[3 - 1] || this.proto.treasureIcon.open[0],
            // 宝箱关闭图标
            closeIcon: this.proto.treasureIcon.close[3 - 1] || this.proto.treasureIcon.close[0],
        }
        // 添加 Boss 宝箱
        this.treasureData.push(treasureData)// 添加 Boss 宝箱
        this.removeEmptyPosition(v2(20, 6))
        this.treasureData.push({ ...treasureData, position: v2(20, 8) })
        this.removeEmptyPosition(v2(20, 8))
    }

    // 初始化障碍物
    protected initObstacle() {
    }

    // 初始化Boss障碍物
    protected initBossObstacle() {
        this.obstacleData.push({ position: v2(18, 6) })
        this.obstacleData.push({ position: v2(18, 8) })
        this.removeEmptyPosition(v2(18, 6))
        this.removeEmptyPosition(v2(18, 8))
    }

    // 初始化强化符文
    protected initReinforcement() {
        for (let i = 0; i < this.emptyPosition.length && i < this.proto.reinforcementData.max ; i++) {
            const pos = this.emptyPosition[Math.floor(Math.random() * this.emptyPosition.length)]
            if (!pos) return
            if (Math.random() < this.proto.reinforcementData.posibility) {
                const reinforcement = this.proto.reinforcementData.data[Math.floor(Math.random() * this.proto.reinforcementData.data.length)]
                if (!reinforcement) return
                this.reinforcementData.push({ position: pos , data: reinforcement })
                this.removeEmptyPosition(pos)
            }
        }
        if (this.reinforcementData.length < this.proto.reinforcementData.min) {
            for (let i = 0; i < this.proto.reinforcementData.min - this.reinforcementData.length; i++) {
                const pos = this.emptyPosition[Math.floor(Math.random() * this.emptyPosition.length)]
                const reinforcement = this.proto.reinforcementData.data[Math.floor(Math.random() * this.proto.reinforcementData.data.length)]
                if (!reinforcement || !pos) return
                this.reinforcementData.push({ position: pos , data: reinforcement })
            }
        }
    }

    // 初始化Boss强化符文
    protected initBossReinforcement() {
        const reinforcement = this.proto.reinforcementData.data[Math.floor(Math.random() * this.proto.reinforcementData.data.length)]
        if (!reinforcement) return
        this.reinforcementData.push({ position: v2(22, 7), data: reinforcement })
    }

    // 移除强化符文
    public removeReinforcement(pos: { x: number, y: number }) {
        for (let i = 0; i < this.reinforcementData.length; i++) {
            const reinforcementData = this.reinforcementData[i];
            if (reinforcementData.position.x === pos.x && reinforcementData.position.y === pos.y) {
                this.reinforcementData.splice(i, 1)
                // 添加到空位置
                this.emptyPosition.push(reinforcementData.position)
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

    // 添加空位置
    protected addEmptyPosition(pos: { x: number, y: number }) {
        this.emptyPosition.push(v2(pos.x, pos.y))
    }

    // 移除空位置
    protected removeEmptyPosition(pos: { x: number, y: number }) {
        for (let i = 0; i < this.emptyPosition.length; i++) {
            const emptyPos = this.emptyPosition[i];
            if (emptyPos.x === pos.x && emptyPos.y === pos.y) {
                this.emptyPosition.splice(i, 1)
                break
            }
        }
    }

}