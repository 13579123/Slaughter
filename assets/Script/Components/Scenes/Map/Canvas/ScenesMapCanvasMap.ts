import { _decorator, Button, Component, director, find, input, Input, instantiate, Node, NodeEventType, Prefab, Sprite, SystemEvent } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { MapData, MonsterData } from 'db://assets/Script/Game/System/Instance/FightMapInstance';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
import { ScenesMapCanvasPlayer } from './ScenesMapCanvasPlayer';
import { CcNative } from 'db://assets/Module/CcNative';
import { FightPrefab } from 'db://assets/Prefabs/Components/FightPrefab/FightPrefab';
import { CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { getCharacterKey, getCharacterPrototype } from 'db://assets/Script/System/Manager/CharacterManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { Progress } from 'db://assets/Script/System/Core/Progress/FightProgress';
import { ItemDTO } from 'db://assets/Script/System/Core/Prototype/ItemPrototype';
import { resourceManager } from 'db://assets/Script/Game/Manager/ResourceManager';
import { backpackManager } from 'db://assets/Script/Game/Manager/BackpackManager';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { EquipmentDTO } from 'db://assets/Script/System/Core/Prototype/EquipmentPrototype';
import { createId } from 'db://assets/Script/Game/Share';
import { characterManager } from 'db://assets/Script/Game/Manager/CharacterManager';
import { achivementManager } from 'db://assets/Script/Game/Manager/AchivementManager';
import { ScenesMapCanvasFial } from './ScenesMapCanvasFial';
const { ccclass, property } = _decorator;

export const mapWidth = 150, mapHeight = 150

@ccclass('ScenesMapCanvasMap')
export class ScenesMapCanvasMap extends ExtensionComponent {

    @property(Node)
    protected PlayerNode: Node = null

    @property(Node)
    protected FialNode: Node = null

    protected instance = getFightMapInstance()

    // 地图模板节点
    protected templateMapItem: Node = null

    // 怪物模板节点
    protected templateMonsterItem: Node = null;

    // 所有地图节点
    protected mapItems: Node[][] = []

    protected start() {
        this.templateMapItem = this.node.getChildByName("MapContent").getChildByName("MapItem")
        this.templateMonsterItem = this.node.getChildByName("MonsterContent").getChildByName("MonsterItem")
        this.templateMapItem.parent = null
        this.templateMonsterItem.parent = null
        this.createFightMap()
        this.renderFightMap()
        this.renderMonster()
    }

    protected createFightMap() {
        const floors = this.instance.proto.icon.floor
        const walls = this.instance.proto.icon.wall
        // 创建地图渲染节点
        this.instance.mapData.forEach((list, y) => {
            list.forEach(async (item, x) => {
                const node = instantiate(this.templateMapItem)
                const maskNode = node.getChildByName("Mask")
                maskNode.active = false
                node.on(NodeEventType.TOUCH_START, () => {
                    maskNode.active = true
                })
                node.on(NodeEventType.TOUCH_END, () => {
                    maskNode.active = false
                    if (item === MapData.Wall) return
                    this.moveTo(x, y)
                })
                node.on(NodeEventType.TOUCH_CANCEL, () => {
                    maskNode.active = false
                })
                this.mapItems[y] = this.mapItems[y] || []
                this.mapItems[y][x] = node
                const floor = floors[Math.floor(Math.random() * floors.length)]
                if (floor)
                    node.getChildByName("Floor").getComponent(Sprite).spriteFrame = await floor()
                const wall = walls[Math.floor(Math.random() * walls.length)]
                if (wall && item === MapData.Wall)
                    node.getChildByName("Icon").getComponent(Sprite).spriteFrame = await wall()
            })
        })
        return
    }

    // 按区域显示地图
    protected renderFightMap() {
        const content = this.node.getChildByName("MapContent")
        content.removeAllChildren()
        this.mapItems.forEach((list, y) => {
            list.forEach((node, x) => {
                if (Math.abs(x - this.instance.playerPosition.x) <= 4 && Math.abs(y - this.instance.playerPosition.y) <= 5) {
                    node.setPosition(
                        x * mapWidth - mapWidth / 2, -y * mapWidth + mapWidth / 2
                    )
                    content.addChild(node)
                }
                return
            })
        })
        return
    }
    
    // 显示怪物 
    protected renderMonster() {
        const content = this.node.getChildByName("MonsterContent")
        content.removeAllChildren()
        this.instance.monsterData.forEach(async monsterData => {
            const node = instantiate(this.templateMonsterItem)
            const spineAnimation = node.getChildByName('Spine').getComponent(SpineAnimation)
            node.setPosition(monsterData.position.x * mapWidth - mapWidth / 2, -monsterData.position.y * mapWidth + mapWidth / 2, 0)
            spineAnimation.skeletonData = await monsterData.character.proto.skeletonData()
            content.addChild(node)
            spineAnimation.playAnimation(monsterData.character.proto.animation.animations.idle)
            if (monsterData.isBoss) {
                node.setScale(node.scale.x * 1.5 , node.scale.y * 1.5)
            }
            return
        })
    }

    // 是否结束
    protected stopMoving: Function = null

    // 移动到指定位置
    async moveTo(x: number, y: number) {
        return new Promise(async res => {
            // 初始化
            if (this.stopMoving) await this.stopMoving()
            // 寻路算法
            const movePath: ("up" | "down" | "left" | "right")[] = this.instance.findPath(
                { x: this.instance.playerPosition.x, y: this.instance.playerPosition.y },
                { x, y }
            )
            // 根据路径移动
            let stop = false, stopRes = null
            this.stopMoving = () => {
                stop = true
                return new Promise(res => stopRes = () => res(null))
            }
            // 循环执行移动路径
            const spineAnimation = this.PlayerNode.getComponent(ScenesMapCanvasPlayer).spineAnimation
            spineAnimation.playAnimation(this.instance.player.proto.animation.animations.move)
            for (let i = 0; i < movePath.length; i++) {
                if (stop) break
                if (movePath[i] === "left") {
                    spineAnimation.node.setScale(
                        -Math.abs(spineAnimation.node.scale.x),
                        spineAnimation.node.scale.y
                    )
                }
                if (movePath[i] === "right") {
                    spineAnimation.node.setScale(
                        Math.abs(spineAnimation.node.scale.x),
                        spineAnimation.node.scale.y
                    )
                }
                // 遇到障碍物则停止移动并且出发相关效果
                let obstacle = this.isObstacle(
                    { x: this.instance.playerPosition.x, y: this.instance.playerPosition.y },
                    movePath[i]
                )
                if (obstacle.type !== "road") {
                    if (obstacle.type === "monster") this.encounterMonster(obstacle.nextPos)
                    break
                }
                // 判断下一步是否是怪物
                await this.PlayerNode.getComponent(ScenesMapCanvasPlayer).movePlayer(movePath[i])
                this.renderFightMap()
            }
            spineAnimation.playAnimation(this.instance.player.proto.animation.animations.idle)
            res(null)
            if (stopRes) stopRes()
            this.stopMoving = null
        })
    }

    // 遭遇怪物回调
    protected async encounterMonster(monsterPos: { x: number, y: number }) {
        const monsterData = this.instance.monsterData.find(
            monsterD => monsterD.position.x === monsterPos.x && monsterD.position.y === monsterPos.y
        )
        if (!monsterData) return
        // 开始战斗
        const parent = find("Canvas")
        const fightPrefab = await(new CcNative.Asset.AssetManager("PrefabResource"))
            .load("FightPrefab/FightPrefab", Prefab)
        const node = CcNative.instantiate(fightPrefab.value)
        parent.addChild(node)
        const successDirect = await node.getComponent(FightPrefab).setFightAndStart({
            player: "left",
            leftCharacter: this.instance.player,
            rightCharacter: monsterData.character,
        })
        // 成功击杀怪物
        if (successDirect === "left") {
            this.instance.removeMonster(monsterPos)
            this.moveTo(monsterPos.x , monsterPos.y)
            this.renderMonster()
            this.instance.player.emitProgress("fightSuccessEnd" , new Progress())
            this.winSettlement(monsterData)
        } else {
            await new Promise(res => setTimeout(res , 500))
            this.FialNode.active = true
            this.FialNode.getComponent(ScenesMapCanvasFial).plaFialAnimation()
        }
        parent.removeChild(node)
    }

    // 胜利结算
    protected winSettlement(monsterData: MonsterData) {
        const exp = monsterData.dto.dropExp()
        const gold = monsterData.dto.dropGold()
        const diamond = monsterData.dto.dropDiamond()
        const dropItems = monsterData.dto.dropItems
        const dropEquipments = monsterData.dto.dropeEquipments

        const items: ItemDTO[] = []
        const equipments: EquipmentDTO[] = []

        characterManager.data.addExp(exp)
        characterManager.save()

        resourceManager.data.addGold(gold)
        resourceManager.data.addDiamond(diamond)
        resourceManager.save()

        for (let i = 0; i < dropItems.length; i++) {
            if (dropItems[i].posibility() > Math.random()) {
                const count = dropItems[i].count()
                backpackManager.data.addItem(dropItems[i].item, count)
                items.push({ prototype: dropItems[i].item, count })
            }
        }
        backpackManager.save()
        for (let i = 0; i < dropEquipments.length; i++) {
            if (dropEquipments[i].posibility() > Math.random()) {
                const dto: EquipmentDTO = {
                    lv: 1,
                    id: createId(),
                    extraProperty: {},
                    prototype: dropEquipments[i].equipment,
                    quality: dropEquipments[i].quality(),
                }
                equipmentManager.data.addEquipment(dto.prototype , dto.quality)
                equipments.push(dto)
            }
        }
        equipmentManager.save()
        
        if (gold > 0 || diamond > 0 || items.length > 0 || equipments.length > 0)
            message.congratulations(gold , diamond , items , equipments)

        // 添加击杀
        achivementManager.data.addKillRecord(getCharacterKey(monsterData.character.proto))
        achivementManager.save()
        
    }

    // 判断下一步是否是障碍物
    protected isObstacle(pos: { x: number, y: number }, next: "up" | "down" | "left" | "right") {
        const isMonster = (nextPos: { x: number, y: number }) => {
            for (let i = 0; i < this.instance.monsterData.length; i++) {
                const monsterData = this.instance.monsterData[i];
                if (monsterData.position.x === nextPos.x && monsterData.position.y === nextPos.y) {
                    return true
                }
            }
        }
        let nextPos: { x: number, y: number }
        switch (next) {
            case "up": {
                nextPos = { x: pos.x, y: pos.y - 1 }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                break
            }
            case "down": {
                nextPos = { x: pos.x, y: pos.y + 1 }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                break
            }
            case "left": {
                nextPos = { x: pos.x - 1, y: pos.y }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                break
            }
            case "right": {
                nextPos = { x: pos.x + 1, y: pos.y }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                break
            }
        }
        return { type: "road", nextPos }
    }

    protected update(dt: number): void {
        // 同步虚拟坐标
        const pos = this.PlayerNode.getComponent(ScenesMapCanvasPlayer).virtualPosition
        this.node.getChildByName("MapContent").setPosition(-pos.x , -pos.y)
        this.node.getChildByName("MonsterContent").setPosition(-pos.x , -pos.y)
    }

}


