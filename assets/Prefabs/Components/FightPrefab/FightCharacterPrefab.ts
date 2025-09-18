import { _decorator, Button, Color, Component, find, instantiate, Label, Node, Prefab, sp, Sprite, UITransform } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { ModuleProgressPrefab } from 'db://assets/Module/Prefabs/ModuleProgressPrefab';
import { Rx } from 'db://assets/Module/Rx';
import { CharacterEvent, CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { DetailInfoPrefab } from '../DetailInfoPrefab';
import { Normal } from 'db://assets/Script/System/Normal';
import { FightBuffItemPrefab } from './FightBuffItemPrefab';
import { SkillInstance } from 'db://assets/Script/System/Core/Instance/SkillInstance';
import { DamageType, FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
const { ccclass, property } = _decorator;

@ccclass('FightCharacterPrefab')
export class FightCharacterPrefab extends ExtensionComponent {

    // 详情界面
    @property(Prefab)
    public FightBuffItemPrefab: Prefab = null;

    // 位置
    public pos: "left" | "right";

    // 是否在释放技能行动状态
    public isSkilling: boolean = false;

    // 展示状态
    public isPlayer: boolean = false;

    // 是否准备
    public isReady: boolean = false;

    // 角色数据
    public character: CharacterInstance = null;

    // 帧事件监听
    public frameEvent: Array<(event: sp.spine.Event) => void> = []

    // 绑定角色数据和状态
    public async bindCharacter(character: CharacterInstance, pos: "left" | "right", isPlayer = true) {
        // 展示状态
        this.isPlayer = isPlayer
        // 设置位置
        this.pos = pos
        // spine节点
        const spine = this.node.getChildByName("Spine")
        // 设置角色数据
        this.character = Rx.reactive(character)
        // 展示角色数值
        this.showNumberMessage()
        // 设置位置
        if (pos === "left") spine.setScale(1, 1)
        else if (pos === "right") {
            spine.setScale(-1, 1)
            this.node.getChildByName("State")
                .getChildByName("Mp").getChildByName("Progress").setScale(-1, 1)
            this.node.getChildByName("State")
                .getChildByName("Hp").getChildByName("Progress").setScale(-1, 1)
        }
        // 设置等级
        this.node.getChildByName("State").getChildByName("Level")
            .getComponent(Label).string = "Lv : " + character.lv
        // 设置spine数据
        this.character.proto.skeletonData().then(sk => {
            spine.getComponent(SpineAnimation).skeletonData = sk
        })
        // 右侧mp位置为 25px
        const mpNode = this.node.getChildByName("State").getChildByName("Mp")
        mpNode.setPosition(pos === "right" ? 25 : -25, mpNode.position.y)
        // 绑定数据展示 
        const mpProgress = this.node.getChildByName("State")
            .getChildByName("Mp").getChildByName("Progress").getComponent(ModuleProgressPrefab)
        const mpLabel = this.node.getChildByName("State")
            .getChildByName("Mp").getChildByName("Label").getComponent(Label)
        const hpProgress = this.node.getChildByName("State")
            .getChildByName("Hp").getChildByName("Progress").getComponent(ModuleProgressPrefab)
        const hpLabel = this.node.getChildByName("State")
            .getChildByName("Hp").getChildByName("Label").getComponent(Label)
        // 绑定生命值和魔法值
        this.effect(() => {
            mpProgress.setProgress(this.character.mp)
            hpProgress.setProgress(this.character.hp)
            mpLabel.string = Normal.number(this.character.mp * this.character.maxMp) + " / "
                + Normal.number(this.character.maxMp)
            hpLabel.string = Normal.number(this.character.hp * this.character.maxHp) + " / "
                + Normal.number(this.character.maxHp)
        })
        // 绑定buff展示
        const buffContainer = this.node.getChildByName("State").getChildByName("Buff")
        this.effect(() => {
            buffContainer.removeAllChildren()
            this.character.buffs.forEach(async buff => {
                const itemNode = CcNative.instantiate(this.FightBuffItemPrefab)
                itemNode.getComponent(FightBuffItemPrefab).setBuffData(buff)
                buffContainer.addChild(itemNode)
            })
            return
        })
    }

    // 展示角色受伤或者回复数值
    public showNumberMessage() {
        const messageContainer = this.node.getChildByName("Message")
        const tempNode = messageContainer.getChildByName("Temp")
        messageContainer.removeAllChildren()
        // 监听扣血事件
        this.character.on(CharacterEvent.ReduceHp , (progress: {
            reduce: number,
            type: DamageType,
            from: CharacterInstance,
            fromType: FromType
        }) => {
            if (progress.reduce <= 0) return
            let color = new Color(255, 255, 255)
            if (progress.type === DamageType.real) color = new Color(255, 255, 255)
            if (progress.type === DamageType.physic) color = new Color(250, 15, 15)
            if (progress.type === DamageType.magic) color = new Color(10, 50, 200)
            if (progress.type === DamageType.light) color = new Color(230, 150, 15)
            if (progress.type === DamageType.dark) color = new Color(125, 10, 230)
            showMessage(`-${Normal.number(progress.reduce)}` , color)
        })
        // 监听回复事件
        this.character.on(CharacterEvent.IncreaseHp , (progress: {
            increase: number,
            from?: CharacterInstance,
            fromType?: FromType
        }) => {
            showMessage(`+${Normal.number(progress.increase)}` , new Color(85, 225 , 0))
        })
        // 创建节点
        const createNumberNode = (s: string , color: Color) => {
            const node = instantiate(tempNode)
            const label = node.getComponent(Label)
            label.string = s
            label.color = color
            // 节点位置向上
            this.setAutoInterval(() => {
                const label = node.getComponent(Label)
                const color = label.color
                node.setPosition(node.position.x , node.position.y + 5)
                label.color = new Color(color.r , color.g , color.b , color.a - 3)
            } , {count: 20 , complete() { node.parent = null;node.destroy() } , timer: 25})
            return node
        }
        // 是否正在清理队列
        let isClearing = false
        // 队伍列表
        const showMessageQueue: {s: string , color: Color}[] = []
        // 展示伤害和回复信息
        // 每次信息展示间隔不低于 100 ms
        const showMessage = (s: string , color: Color) => {
            showMessageQueue.push({s , color})
            if (isClearing) return
            // 开始清理队列
            isClearing = true
            clearQueue()
        }
        // 清理队列
        const clearQueue = async () => {
            while (showMessageQueue.length > 0) { 
                const dto = showMessageQueue.shift()
                const node = createNumberNode(dto.s , dto.color)
                messageContainer.addChild(node)
                await new Promise(resolve => setTimeout(resolve , 100))
            }
            isClearing = false
            return
        }
    }

    // 播放角色入场动画
    public async characterEnter() {
        // 初始位置和移动距离
        let startPosx = 0, xMove = 0
        if (this.pos === "left") {
            startPosx = -250
            xMove = +2
        } else if (this.pos === "right") {
            startPosx = +250
            xMove = -2
        }
        // 隐藏状态
        this.node.getChildByName("State").active = false
        // 播放动画
        const spine = this.node.getChildByName("Spine")
        spine.setPosition(startPosx, spine.y)
        spine.getComponent(SpineAnimation).playAnimation(
            this.character.proto.animation.animations.move
        )
        // 移动到指定位置
        const promise = new Promise((res) => {
            const close = this.setAutoInterval(() => {
                startPosx += xMove
                spine.setPosition(startPosx, spine.y)
                if (startPosx === 0) {
                    close()
                    res(null)
                }
            })
        })
        return promise
    }

    // 角色准备
    public characterReady() {
        // 播放idle动画
        const spine = this.node.getChildByName("Spine")
        spine.getComponent(SpineAnimation).playAnimation(
            this.character.proto.animation.animations.idle,
            { count: -1 }
        )
        // 准备
        this.isReady = true
        // 展示状态信息
        if (this.isPlayer) this.node.getChildByName("State").active = true
    }

    // 播放攻击动画
    public async characterAttack(attackEffect: Function) {
        if (!this.isReady) return
        if (this.isSkilling) return
        this.isSkilling = true
        // 播放攻击动画
        const spine = this.node.getChildByName("Spine").getComponent(SpineAnimation)
        // 攻击生效
        const attackEffectCallback = (e: sp.spine.Event) => {
            attackEffect()
            // 移除攻击生效回调
            spine.removeFrameEvent(
                this.character.proto.animation.animationFrameName.attack,
                attackEffectCallback
            )
        }
        spine.listenFrameEvent(this.character.proto.animation.animationFrameName.attack, attackEffectCallback)
        // 工具攻击速度来设置攻击动画的播放速度
        return new Promise<void>(res => {
            spine.playAnimation(
                this.character.proto.animation.animations.attack,
                { count: 1, speed: this.character.attackSpeed }
            ).then(() => {
                this.isSkilling = false
                res()
            })
        })
    }

    // 播放技能动画
    public async characterSkill(skillEffect: Function) {
        if (!this.isReady) return
        this.isSkilling = true
        // 播放技能动画
        const spine = this.node.getChildByName("Spine").getComponent(SpineAnimation)
        return new Promise<void>(res => {
            spine.playAnimation(this.character.proto.animation.animations.skill, { count: 1 })
                .then(() => {
                    this.isSkilling = false
                    res()
                })
            const skillEffectCallback = () => {
                // 技能生效
                skillEffect()
                spine.removeFrameEvent(
                    this.character.proto.animation.animationFrameName.skill,
                    skillEffectCallback
                )
            }
            spine.listenFrameEvent(this.character.proto.animation.animationFrameName.skill, skillEffectCallback)
        })
    }

    // 播放死亡动画
    public async characterDie() {
        if (!this.isReady) return
        // 播放死亡动画
        const spine = this.node.getChildByName("Spine").getComponent(SpineAnimation)
        await spine.playAnimation(this.character.proto.animation.animations.die, { count: 1 })
    }

    // 帧间事件
    protected update(dt: number): void {
        if (this.isReady) {
            // 处理buff
            this.character.buffs.forEach(buff => buff.proto.tick(dt))
        }
    }

}


