import { _decorator, Button, Color, Component, director, find, input, Input, instantiate, KeyCode, Node, NodeEventType, Prefab, Sprite, SystemEvent, UITransform, Vec2 } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { MapData, MonsterData, TreasureData } from 'db://assets/Script/Game/System/Instance/FightMapInstance';
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
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { LanguageManager } from 'db://assets/Module/Language/LanguageManager';
import { ScenesMapCanvasSound } from './ScenesMapCanvasSound';
const { ccclass, property } = _decorator;

export const mapWidth = 130, mapHeight = 130

@ccclass('ScenesMapCanvasMap')
export class ScenesMapCanvasMap extends ExtensionComponent {

    @property(Node)
    protected PlayerNode: Node = null

    @property(Node)
    protected SoundNode: Node = null

    @property(Node)
    protected FialNode: Node = null

    @property(Node)
    protected MiniMapContentNode: Node = null

    @property(Node)
    protected FightContentNode: Node = null

    @property(Node)
    protected TrangleNode: Node = null

    protected instance = getFightMapInstance()

    // 地图模板节点
    protected templateMapItem: Node = null

    // 小地图模板节点
    protected templateMiniMapItem: Node = null

    // 怪物模板节点
    protected templateMonsterItem: Node = null;

    // 障碍物模板节点
    protected templateObstacleItem: Node = null

    // 宝箱模板节点
    protected templatetreasureItem: Node = null

    // 强化符文模板节点
    protected templateReinforcementItem: Node = null

    // 所有地图节点
    protected mapItems: Node[][] = []

    // 所有强化符文节点
    protected reinforcementItems: Node[][] = []

    // 所有怪物节点
    protected monsterItems: Node[][] = []

    // 所有小地图节点
    protected miniMapItems: Node[][] = []

    protected start() {
        this.templateMapItem = this.node.getChildByName("MapContent").getChildByName("MapItem")
        this.templateMonsterItem = this.node.getChildByName("MonsterContent").getChildByName("MonsterItem")
        this.templateObstacleItem = this.node.getChildByName("ObstacleContent").getChildByName("ObstacleIcon")
        this.templatetreasureItem = this.node.getChildByName("TreasureContent").getChildByName("TreasureIcon")
        this.templateReinforcementItem = this.node.getChildByName("ReinforcementContent").getChildByName("ReinforcementItem")
        this.templateMiniMapItem = this.MiniMapContentNode.children[0]
        this.templateMapItem.parent = null
        this.templateMonsterItem.parent = null
        this.templateMiniMapItem.parent = null
        this.templatetreasureItem.parent = null
        this.createFightMap()
        this.createMiniFightMap()
        this.renderMonster()
        this.renderTreasure()
        this.renderObstacle()
        this.renderReinforcement()
        this.renderFightMap()
        this.renderMiniMap()
    }

    // 创建战斗地图
    protected createFightMap() {
        const floors = this.instance.proto.floorIcon
        // 创建地图渲染节点
        this.instance.mapData.forEach((list, y) => {
            list.forEach(async (item, x) => {
                const node = instantiate(this.templateMapItem)
                const maskNode = node.getChildByName("Mask")
                maskNode.active = false
                node.on(NodeEventType.TOUCH_START, () => {
                    maskNode.active = true
                })
                node.on(NodeEventType.TOUCH_CANCEL, () => {
                    maskNode.active = false
                })
                node.on(NodeEventType.TOUCH_END, async () => {
                    maskNode.active = false
                    if (item !== MapData.None) this.moveTo(x, y)
                })
                this.mapItems[y] = this.mapItems[y] || []
                this.mapItems[y][x] = node
                if (item === MapData.None) return
                let floor = floors.floor[0]
                if (item === MapData.Floor)
                    floor = floors.floor[Math.floor(Math.random() * floors.floor.length)]
                if (item === MapData.Special)
                    floor = floors.special[Math.floor(Math.random() * floors.special.length)]
                node.getChildByName("Floor").getComponent(Sprite).spriteFrame = await floor()
                return
            })
        })
        return
    }

    // 创建小地图
    protected createMiniFightMap() {
        this.instance.mapData.forEach((list, y) => {
            list.forEach(async (item, x) => {
                // 小地图
                const miniMap = instantiate(this.templateMiniMapItem)
                miniMap.getComponent(UITransform).width = 15
                miniMap.getComponent(UITransform).height = 15
                if (!this.miniMapItems[y]) this.miniMapItems[y] = []
                if (item !== MapData.None) this.miniMapItems[y][x] = miniMap
            })
        })
        return
    }

    // 按区域显示地图
    protected renderFightMap() {
        const areax = 5, areay = 6
        const content = this.node.getChildByName("MapContent")
        content.removeAllChildren()
        this.mapItems.forEach((list, y) => {
            list.forEach((node, x) => {
                if (Math.abs(x - this.instance.playerPosition.x) <= areax && Math.abs(y - this.instance.playerPosition.y) <= areay) {
                    node.setPosition(x * mapWidth - mapWidth / 2, -y * mapWidth + mapWidth / 2)
                    content.addChild(node)
                }
                return
            })
        })
        return
    }

    // 渲染小地图
    protected renderMiniMap() {
        const miniAreax = 10, miniAreay = 10
        this.MiniMapContentNode.removeAllChildren()
        this.miniMapItems.forEach((list, y) => {
            list.forEach((node, x) => {
                if (!node) return
                if (Math.abs(x - this.instance.playerPosition.x) <= miniAreax && Math.abs(y - this.instance.playerPosition.y) <= miniAreay) {
                    node.setPosition(x * 15 - 15 / 2, -y * 15 + 15 / 2)
                    node.getChildByName("MonsterIcon").active = false
                    node.getChildByName("BossIcon").active = false
                    node.getChildByName("EndIcon").active = false
                    node.getChildByName("TreasureIcon").active = false
                    // 结束位置
                    if (this.instance.endPosition.x === x && this.instance.endPosition.y === y) {
                        node.getChildByName("EndIcon").active = true
                    }
                    // 怪物位置
                    const monster = this.instance.monsterData.find(monster => {
                        if (monster.position.x === x && monster.position.y === y) {
                            return true
                        }
                    })
                    if (monster) {
                        if (monster.isBoss) node.getChildByName("BossIcon").active = true
                        else node.getChildByName("MonsterIcon").active = true
                    }
                    // 宝箱位置
                    const treasure = this.instance.treasureData.find(treasure => {
                        if (treasure.position.x === x && treasure.position.y === y) return true
                    })
                    if (treasure) node.getChildByName("TreasureIcon").active = true
                    // 添加节点
                    this.MiniMapContentNode.addChild(node)
                }
                return
            })
        })
    }

    // 显示怪物 
    protected renderMonster() {
        const content = this.node.getChildByName("MonsterContent")
        content.removeAllChildren()
        this.instance.monsterData.forEach(async monsterData => {
            const node = instantiate(this.templateMonsterItem)
            if (!this.monsterItems[monsterData.position.y]) this.monsterItems[monsterData.position.y] = []
            this.monsterItems[monsterData.position.y][monsterData.position.x] = node
            const spineAnimation = node.getChildByName('Spine').getComponent(SpineAnimation)
            node.setPosition(
                monsterData.position.x * mapWidth - mapWidth / 2,
                -monsterData.position.y * mapHeight + mapHeight / 2,
                0
            )
            spineAnimation.skeletonData = await monsterData.character.proto.skeletonData()
            content.addChild(node)
            spineAnimation.playAnimation(monsterData.character.proto.animation.animations.idle)
            if (monsterData.isBoss) {
                node.setScale(node.scale.x * 1.5, node.scale.y * 1.5)
            }
            return
        })
    }

    // 显示宝箱
    protected renderTreasure() {
        const content = this.node.getChildByName("TreasureContent")
        const children = content.children
        content.removeAllChildren()
        children.forEach(child => child.destroy())
        this.instance.treasureData.forEach(async treasureData => {
            const node = instantiate(this.templatetreasureItem)
            node.setPosition(
                treasureData.position.x * mapWidth - mapWidth / 2,
                -treasureData.position.y * mapHeight + mapHeight / 2,
                0
            )
            if (treasureData.open) {
                const icon = await treasureData.openIcon()
                node.getComponent(Sprite).spriteFrame = icon
            }
            else {
                const icon = await treasureData.closeIcon()
                node.getComponent(Sprite).spriteFrame = icon
            }
            content.addChild(node)
        })
        return
    }

    // 显示障碍物
    protected renderObstacle() {
        const content = this.node.getChildByName("ObstacleContent")
        content.removeAllChildren()
        this.instance.obstacleData.forEach(async obstacleData => {
            const node = instantiate(this.templateObstacleItem)
            node.setPosition(
                obstacleData.position.x * mapWidth - mapWidth / 2,
                -obstacleData.position.y * mapHeight + mapHeight / 2,
                0
            )
            const icon = this.instance.proto.obstacleIcon[
                Math.floor(Math.random() * this.instance.proto.obstacleIcon.length)
            ]
            node.getComponent(Sprite).spriteFrame = await icon()
            node.getComponent(UITransform).width = mapWidth
            node.getComponent(UITransform).height = mapWidth
            content.addChild(node)
        })
    }

    // 显示强化符文
    protected renderReinforcement() {
        const content = this.node.getChildByName("ReinforcementContent")
        content.removeAllChildren()
        this.reinforcementItems = []
        this.instance.reinforcementData.forEach(async reinforcementData => {
            let node: Node = null
            node = instantiate(this.templateReinforcementItem)
            node.setPosition(
                reinforcementData.position.x * mapWidth - mapWidth / 2,
                -reinforcementData.position.y * mapHeight + mapHeight / 2,
                0
            )
            if (!this.reinforcementItems[reinforcementData.position.y]) this.reinforcementItems[reinforcementData.position.y] = []
            this.reinforcementItems[reinforcementData.position.y][reinforcementData.position.x] = node
            const icon = await reinforcementData.data.icon()
            node.getComponent(Sprite).spriteFrame = icon
            content.addChild(node)
        })
    }

    // 是否结束
    protected stopMoving: Function = null

    // 是否是取消的移动还是到达终点的移动
    protected isCancelMoving: boolean = false

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
                this.isCancelMoving = true
                return new Promise(res => stopRes = () => res(null))
            }
            // 循环执行移动路径
            const spineAnimation = this.PlayerNode.getComponent(ScenesMapCanvasPlayer).spineAnimation
            // 播放动画
            if (!this.isCancelMoving)
                spineAnimation.playAnimation(
                    this.instance.player.proto.animation.animations.move,
                    { animationCache: true }
                )
            this.isCancelMoving = false
            for (let i = 0; i < movePath.length; i++) {
                // 停止移动
                if (stop) break
                // 移动转向
                this.turnDirection(movePath[i])
                // 遇到障碍物则停止移动并且出发相关效果
                let obstacle = this.isObstacle(
                    { x: this.instance.playerPosition.x, y: this.instance.playerPosition.y }, movePath[i]
                )
                // 判断下一步是否是怪物
                if (obstacle.type === "monster") {
                    this.encounterMonster(obstacle.nextPos)
                    break
                }
                // 判断下一步是宝箱
                if (obstacle.type === "treasure") {
                    this.encounterTreasure(obstacle.nextPos)
                    break
                }
                // 判断下一步是否是离开传送门
                if (obstacle.type === "end") {
                    this.onLeave()
                    break
                }
                // 判断下一步是否是强化符文
                if (obstacle.type === "reinforcement") {
                    this.encounterReinforcecment(obstacle.nextPos)
                }
                // 移动
                await this.PlayerNode.getComponent(ScenesMapCanvasPlayer).movePlayer(movePath[i])
                this.renderFightMap()
                this.renderMiniMap()
            }
            // 播放等待动画
            if (!this.isCancelMoving)
                spineAnimation.playAnimation(
                    this.instance.player.proto.animation.animations.idle
                )
            res(null)
            if (stopRes) stopRes()
            this.stopMoving = null
        })
    }

    // 转向回调
    protected async turnDirection(direction: string) {
        const spineAnimation = this.PlayerNode.getComponent(ScenesMapCanvasPlayer).spineAnimation
        if (direction === "left") {
            spineAnimation.node.setScale(
                -Math.abs(spineAnimation.node.scale.x),
                spineAnimation.node.scale.y
            )
            this.TrangleNode.angle = 90
        }
        if (direction === "right") {
            spineAnimation.node.setScale(
                Math.abs(spineAnimation.node.scale.x),
                spineAnimation.node.scale.y
            )
            this.TrangleNode.angle = -90
        }
        if (direction === "up") {
            this.TrangleNode.angle = 0
        }
        if (direction === "down") {
            this.TrangleNode.angle = 180
        }
    }

    // 遭遇怪物回调
    protected async encounterMonster(monsterPos: { x: number, y: number }) {
        if (!this.monsterItems[monsterPos.y]) return
        if (!this.monsterItems[monsterPos.y][monsterPos.x]) return
        const monsterNode = this.monsterItems[monsterPos.y][monsterPos.x]
        // 怪物数据
        const monsterData = this.instance.monsterData.find(
            monsterD => monsterD.position.x === monsterPos.x && monsterD.position.y === monsterPos.y
        )
        if (!monsterData) return
        // 开始战斗
        const parent = this.FightContentNode
        const fightPrefab = await (new CcNative.Asset.AssetManager("PrefabResource"))
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
            this.moveTo(monsterPos.x, monsterPos.y)
            this.instance.player.emitProgress("fightSuccessEnd", new Progress())
            this.winSettlement(monsterData)
            monsterNode.parent = this.monsterItems[monsterPos.y][monsterPos.x] = null
            monsterNode.destroy()
        } else {
            if (this.instance.player.hp <= 0) {
                await new Promise(res => setTimeout(res, 500))
                this.FialNode.active = true
                this.FialNode.getComponent(ScenesMapCanvasFial).plaFialAnimation()
            }
        }
        parent.removeChild(node)
    }

    // 遭遇宝箱回调
    protected encounterTreasure(treasurePos: { x: number, y: number }) {
        let treasureData: TreasureData
        this.instance.treasureData.forEach(treasure => {
            if (treasure.position.x === treasurePos.x && treasure.position.y === treasurePos.y)
                treasureData = treasure
        })
        if (!treasureData || treasureData.open) return
        const reward = this.instance.proto.getTreasureGoldReward(treasureData.level)
        reward.items.forEach(item => {
            backpackManager.data.addItem(item.prototype, item.count)
        })
        reward.equipments.forEach(equip => {
            equipmentManager.data.addEquipment(equip.prototype, equip.quality)
        })
        backpackManager.save()
        equipmentManager.save()
        message.congratulations(reward.gold, reward.diamond, reward.items, reward.equipments)
        treasureData.open = true
        // 播放音效
        this.SoundNode.getComponent(ScenesMapCanvasSound).playGetAwardSound()
        // 渲染宝箱
        this.renderTreasure()
    }

    // 遭遇强化符文
    protected async encounterReinforcecment(rineforcecmentPos: { x: number, y: number }) {
        if (!this.reinforcementItems[rineforcecmentPos.y]) return
        if (!this.reinforcementItems[rineforcecmentPos.y][rineforcecmentPos.x]) return
        const node = this.reinforcementItems[rineforcecmentPos.y][rineforcecmentPos.x]
        
        // 符文数据
        const reinforcementData = this.instance.reinforcementData.find(v => {
            return v.position.x === rineforcecmentPos.x && v.position.y === rineforcecmentPos.y
        })

        this.instance.removeReinforcement(rineforcecmentPos)

        const playDestroyAnimation = async () => {
            return new Promise(res => {
                const sprite = node.getComponent(Sprite)
                let rgba = new Color(255, 255, 255, 255)
                let posY = node.position.y
                this.setAutoInterval(() => {
                    sprite.color = rgba
                    node.setPosition(node.x, posY)
                    posY += 2.5
                    rgba = new Color(255, 255, 255, rgba.a - 9)
                }, { timer: 35, count: 30, complete: () => res(null) })
            })
        }

        this.instance.player.addProperty(reinforcementData.data.property())
        await playDestroyAnimation()
        this.reinforcementItems[rineforcecmentPos.y][rineforcecmentPos.x] = node.parent = null
        node.destroy()
    }

    // 离开回调
    protected async onLeave() {
        // 确认框
        const confirm = await message.confirm(
            (new class extends LanguageEntry {
                public get chs(): string {
                    return "提示"
                }
                public get eng(): string {
                    return "Hint"
                }
                public get jpn(): string {
                    return "ヒント"
                }
            }).getValue(settingManager.data.language),
            (new class extends LanguageEntry {
                public get chs(): string {
                    return "是否要离开本关卡？"
                }
                public get eng(): string {
                    return "Do you want to leave this level?"
                }
                public get jpn(): string {
                    return "本レベルを離れますか？"
                }
            }).getValue(settingManager.data.language),
            LanguageManager.getEntry("Confirm").getValue(settingManager.data.language),
            LanguageManager.getEntry("Cancel").getValue(settingManager.data.language),
        )
        // 下一关
        if (confirm) this.instance.proto.onLeave()
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
        for (let i = 0; i < dropEquipments.length; i++) {
            if (dropEquipments[i].posibility() > Math.random()) {
                const dto: EquipmentDTO = {
                    lv: 1,
                    id: createId(),
                    extraProperty: {},
                    prototype: dropEquipments[i].equipment,
                    quality: dropEquipments[i].quality(),
                }
                equipmentManager.data.addEquipment(dto.prototype, dto.quality)
                equipments.push(dto)
            }
        }
        if (gold > 0 || diamond > 0 || items.length > 0 || equipments.length > 0)
            message.congratulations(gold, diamond, items, equipments)
        // 添加击杀记录
        achivementManager.data.addKillRecord(getCharacterKey(monsterData.character.proto))

        backpackManager.save()
        equipmentManager.save()
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
        const isEnd = (nextPos: { x: number, y: number }) => {
            return nextPos.x === this.instance.endPosition.x && nextPos.y === this.instance.endPosition.y
        }
        const isTreasure = (nextPos: { x: number, y: number }) => {
            for (let i = 0; i < this.instance.treasureData.length; i++) {
                const treasureData = this.instance.treasureData[i];
                if (treasureData.position.x === nextPos.x && treasureData.position.y === nextPos.y) {
                    return true
                }
            }
        }
        const isReinforcement = (nextPos: { x: number, y: number }) => {
            for (let i = 0; i < this.instance.reinforcementData.length; i++) {
                const reinforcementData = this.instance.reinforcementData[i];
                if (reinforcementData.position.x === nextPos.x && reinforcementData.position.y === nextPos.y) {
                    return true
                }
            }
        }
        let nextPos: { x: number, y: number }
        switch (next) {
            case "up": {
                nextPos = { x: pos.x, y: pos.y - 1 }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                if (isEnd(nextPos)) return { type: "end", nextPos }
                if (isTreasure(nextPos)) return { type: "treasure", nextPos }
                if (isReinforcement(nextPos)) return { type: "reinforcement", nextPos }
                break
            }
            case "down": {
                nextPos = { x: pos.x, y: pos.y + 1 }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                if (isEnd(nextPos)) return { type: "end", nextPos }
                if (isTreasure(nextPos)) return { type: "treasure", nextPos }
                if (isReinforcement(nextPos)) return { type: "reinforcement", nextPos }
                break
            }
            case "left": {
                nextPos = { x: pos.x - 1, y: pos.y }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                if (isEnd(nextPos)) return { type: "end", nextPos }
                if (isTreasure(nextPos)) return { type: "treasure", nextPos }
                if (isReinforcement(nextPos)) return { type: "reinforcement", nextPos }
                break
            }
            case "right": {
                nextPos = { x: pos.x + 1, y: pos.y }
                if (isMonster(nextPos)) return { type: "monster", nextPos }
                if (isEnd(nextPos)) return { type: "end", nextPos }
                if (isTreasure(nextPos)) return { type: "treasure", nextPos }
                if (isReinforcement(nextPos)) return { type: "reinforcement", nextPos }
                break
            }
        }
        return { type: "road", nextPos }
    }

    protected update(dt: number): void {
        // 同步虚拟坐标
        const pos = this.PlayerNode.getComponent(ScenesMapCanvasPlayer).virtualPosition
        this.node.getChildByName("MapContent").setPosition(-pos.x, -pos.y)
        this.node.getChildByName("MonsterContent").setPosition(-pos.x, -pos.y)
        this.node.getChildByName("ObstacleContent").setPosition(-pos.x, -pos.y)
        this.node.getChildByName("TreasureContent").setPosition(-pos.x, -pos.y)
        this.node.getChildByName("ReinforcementContent").setPosition(-pos.x, -pos.y)
        this.node.getChildByName("EndIcon").setPosition(
            -pos.x - mapWidth / 2 + this.instance.endPosition.x * mapWidth,
            -pos.y + mapHeight / 2 - this.instance.endPosition.y * mapHeight
        )
        this.MiniMapContentNode.setPosition(-pos.x * 15 / mapWidth, -pos.y * 15 / mapWidth)
    }

}
