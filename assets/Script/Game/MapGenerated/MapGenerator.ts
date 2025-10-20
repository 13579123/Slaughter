import { MapData } from "../System/Instance/FightMapInstance"

export enum RoomType {
    OrdinaryRoom = "ordinaryRoom",
    TreasureRoom = "treasureRoom",
}

export class MapGenerator {

    // 转换为奇数
    protected convertToOdd(num: number) {
        return num % 2 === 0 ? num + 1 : num
    }

    // 生成随机房间
    public generateRandomRoom(
        size: { width: number, height: number },
        rooms: { pos: { x: number, y: number }, size: { width: number, height: number } , type: RoomType }[],
        roomLoopCount: number = Math.floor(Math.random() * 10) + 9
    ) {
        const mapData: MapData[][] = []
        // 初始化地图
        for (let y = 0; y < size.height; y++) {
            mapData[y] = []
            for (let x = 0; x < size.width; x++) {
                mapData[y][x] = 0
            }
        }
        // 判断是否重叠或者超出
        const isOverlap = (posX: number, posY: number, width: number, height: number) => {
            for (let y = -1; y < height + 1; y++) {
                for (let x = -1; x < width + 1; x++) {
                    if (
                        posX + x < 0 ||
                        posY + y < 0 ||
                        posY + y >= size.height ||
                        posX + x >= size.width ||
                        mapData[posY + y][posX + x] !== MapData.None
                    ) {
                        return true
                    }
                }
            }
            return false
        }
        // 随机添加房间
        while (roomLoopCount > 0) {
            // 随机位置
            const posX = Math.floor(Math.random() * size.width - 1) + 1
            const posY = Math.floor(Math.random() * size.height - 1) + 1
            // 随机大小
            const width = this.convertToOdd(Math.floor(Math.random() * 4) + 5)
            const height = this.convertToOdd(Math.floor(Math.random() * 4) + 5)
            // 判断是否重叠
            const hasOverlap = isOverlap(posX, posY, width, height)
            if (!hasOverlap) {
                let roomType: RoomType = RoomType.OrdinaryRoom
                // 小概率是宝箱房
                if (Math.random() < 1.05) roomType = RoomType.TreasureRoom
                rooms.push({ pos: { x: posX, y: posY }, size: { width, height }, type: roomType })
                // 添加到地图
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        if (roomType === RoomType.OrdinaryRoom) mapData[posY + y][posX + x] = 1
                        else mapData[posY + y][posX + x] = 2
                    }
                }
            }
            roomLoopCount--
        }
        return mapData
    }

    // 生成随机迷宫
    public generateRandomMaze(size: { width: number, height: number }) {
        const mapData: (0 | 1)[][] = []
        const notEnterRoomMap = new Set<string>()
        const hasGoButHasNotEnterRoomMap = new Set<string>()
        // 初始化为基础地图
        const sizeHeight = size.height % 2 === 0 ? size.height + 1 : size.height
        const sizeWidth = size.width % 2 === 0 ? size.width + 1 : size.width
        // 初始化全是墙
        for (let i = 0; i < sizeHeight; i++) {
            const list = []
            for (let j = 0; j < sizeWidth; j++) {
                if ((i - 1) % 2 === 0 && (j - 1) % 2 === 0 && i !== size.width - 1 && j !== size.height - 1) {
                    list.push(1)
                    notEnterRoomMap.add(`${j} ${i}`)
                }
                else list.push(0)
            }
            mapData.push(list)
        }
        // 随机生成地图 砸墙算法
        let posx = 1, posy = 1
        while (notEnterRoomMap.size > 0) {
            // 房间已经进入
            notEnterRoomMap.delete(`${posx} ${posy}`)
            // 可以走的方向
            const direct: { x: number, y: number, wallX: number, wallY: number }[] = []
            if (posx - 2 > 0 && notEnterRoomMap.has(`${posx - 2} ${posy}`))
                direct.push({ x: posx - 2, y: posy, wallX: posx - 1, wallY: posy })
            if (posx + 2 < size.width - 1 && notEnterRoomMap.has(`${posx + 2} ${posy}`))
                direct.push({ x: posx + 2, y: posy, wallX: posx + 1, wallY: posy })
            if (posy - 2 > 0 && notEnterRoomMap.has(`${posx} ${posy - 2}`))
                direct.push({ x: posx, y: posy - 2, wallX: posx, wallY: posy - 1 })
            if (posy + 2 < size.height - 1 && notEnterRoomMap.has(`${posx} ${posy + 2}`))
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
            mapData[nextPos.wallY][nextPos.wallX] = 1
        }
        return mapData
    }

    // 消除迷宫死胡同
    public removeDeadEnd(mapData: MapData[][]) {
        const nearFloorCount = (x: number, y: number) => {
            if (mapData[y][x] === 0) return []
            let directions: ("left" | "right" | "top" | "bottom")[] = [];
            [
                [x - 1, y, "left"],
                [x + 1, y, "right"],
                [x, y - 1, "top"],
                [x, y + 1, "bottom"],
            ].forEach(([nx, ny, direct]) => {
                // @ts-ignore
                if (nx < 0 || nx >= mapData[0].length || ny < 0 || ny >= mapData.length) {
                    return
                }
                if (mapData[ny][nx] !== MapData.None) {
                    directions.push(direct as any)
                }
            })
            return directions
        }
        const hasDeadEnd = () => {
            for (let y = 0; y < mapData.length; y++) {
                const cl = mapData[y]
                for (let x = 0; x < cl.length; x++) {
                    // 周围草地数少于2说明是死胡同
                    if (mapData[y][x] !== MapData.None && nearFloorCount(x, y).length < 2) return true
                }
            }
            return false
        }
        let maxCount = 100
        while (hasDeadEnd() && maxCount > 0) {
            for (let y = 0; y < mapData.length; y++) {
                const cl = mapData[y]
                for (let x = 0; x < cl.length; x++) {
                    // 周围草地数少于2说明是死胡同
                    if (mapData[y][x] !== 0 && nearFloorCount(x, y).length < 2) mapData[y][x] = 0
                }
            }
            maxCount--
        }
        return mapData
    }

}
