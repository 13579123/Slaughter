import { _decorator, AudioClip, AudioSource, Button, Color, Component, find, instantiate, Label, Node, Prefab, sp, Sprite, UITransform } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { AnimationOption, SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { ModuleProgressPrefab } from 'db://assets/Module/Prefabs/ModuleProgressPrefab';
import { Rx } from 'db://assets/Module/Rx';
import { CharacterEvent, CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { DetailInfoPrefab } from '../DetailInfoPrefab';
import { Normal } from 'db://assets/Script/System/Normal';
import { FightBuffItemPrefab } from './FightBuffItemPrefab';
import { SkillInstance } from 'db://assets/Script/System/Core/Instance/SkillInstance';
import { DamageType, FromType } from 'db://assets/Script/System/Core/Prototype/CharacterPrototype';
import { FightPrefab } from './FightPrefab';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
const { ccclass, property } = _decorator;

@ccclass('FightCharacterPrefab')
export class FightCharacterPrefab extends ExtensionComponent {

    // 详情界面
    @property(Prefab)
    public FightBuffItemPrefab: Prefab = null;

    // 位置
    public pos: "left" | "right";

    // 展示状态
    public isPlayer: boolean = false;

    // 是否准备
    public isReady: boolean = false;

    // 角色数据
    public character: CharacterInstance = null;

    // 帧事件监听
    public frameEvent: Array<(event: sp.spine.Event) => void> = []

    public fightPrefab: FightPrefab = null;

    // 绑定角色数据和状态
    public async bindCharacter(character: CharacterInstance, pos: "left" | "right", isPlayer = true) {
        // 设置角色数据
        this.character = Rx.reactive(character)
        // 展示状态
        this.isPlayer = isPlayer
        // 设置位置
        this.pos = pos
        // spine节点
        const spine = this.node.getChildByName("Spine")
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
        // 绑定模板消息节点
        this.messageTempNode = this.node.getChildByName("Message").getChildByName("Temp")
        this.node.getChildByName("Message").removeAllChildren()
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
            hpLabel.string = Normal.number(this.character.hp * this.character.maxHp) + " / "
                + Normal.number(this.character.maxHp)
            mpLabel.string = Normal.number(this.character.mp * this.character.maxMp) + " / "
                + Normal.number(this.character.maxMp)
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

    // 队伍列表
    protected showMessageQueue: { s: string, color: Color }[] = []

    protected messageTempNode: Node

    protected isClearingMessage = false

    // 添加到伤害数据到队列
    public showMessage(s: string, color: Color) {
        this.showMessageQueue.push({ s, color })
        if (this.isClearingMessage) return
        this.isClearingMessage = true
        const messageContainer = this.node.getChildByName('Message')
        const createNumberNode = (s: string, color: Color) => {
            const node = instantiate(this.messageTempNode)
            const label = node.getComponent(Label)
            label.string = s
            label.color = color
            // 节点位置向上
            this.setAutoInterval(() => {
                const label = node.getComponent(Label)
                const color = label.color
                node.setPosition(node.position.x, node.position.y + 5)
                label.color = new Color(color.r, color.g, color.b, color.a - 3)
            }, { count: 20, complete() { node.parent = null; node.destroy() }, timer: 25 })
            return node
        }
        const clearQueue = async () => {
            while (this.showMessageQueue.length > 0) {
                const dto = this.showMessageQueue.shift()
                const node = createNumberNode(dto.s, dto.color)
                messageContainer.addChild(node)
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            this.isClearingMessage = false
            return
        }
        clearQueue()
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
        this.playAnimation(this.character.proto.animation.animations.move, { count: -1 })
        const spine = this.node.getChildByName("Spine")
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
        if (this.character._preDeath || this.character.hasDeath) return
        // 播放idle动画
        this.playAnimation(this.character.proto.animation.animations.idle, { count: -1 })
        // 准备
        this.isReady = true
        // 展示状态信息
        if (this.isPlayer) this.node.getChildByName("State").active = true
    }

    // 释放的技能队列
    protected skillQueue: SkillInstance[] = []

    // 角色释放技能
    public characterUseSkill(skill: SkillInstance) {
        if (this.character._preDeath || this.character.hasDeath) return
        // 该技能已经在队列中
        if (this.skillQueue.indexOf(skill) !== -1) return
        this.skillQueue.push(skill)
    }

    // 行动中
    protected isAction = false

    // 角色行动
    public async characterAction(target: CharacterInstance) {
        if (this.character._preDeath || this.character.hasDeath) return
        if (this.isAction) return
        this.isAction = true
        if (this.skillQueue.length > 0) {
            const skill = this.skillQueue[this.skillQueue.length - 1]
            return new Promise((res) => {
                this.character.useSkill({
                    skill , animationComplete: () => {
                        res(null)
                        this.skillQueue.splice(this.skillQueue.indexOf(skill) , 1)
                        this.isAction = false
                    }
                })
            })
        }
        return new Promise((res) => {
            this.character.attackCharacter({
                target , animationComplete: () => {
                    res(null)
                    this.isAction = false
                }
            })
        })
    }

    // 当前播放的动画
    private currentAnimation: string = ""

    // 播放动画
    public async playAnimation(animationName: string, option: {
        count?: number,
        speed?: number,
        complete?: () => void
        frameEvent?: { name: string, callback: () => void }
    }) {
        if (this.currentAnimation === animationName) return
        this.currentAnimation = animationName
        const spine = this.node.getChildByName("Spine").getComponent(SpineAnimation)
        if (option.frameEvent) {
            const frameCall = () => {
                option.frameEvent.callback()
                spine.removeFrameEvent(option.frameEvent.name, frameCall)
            }
            spine.listenFrameEvent(option.frameEvent.name, frameCall)
        }
        await spine.playAnimation(animationName, option)
        this.currentAnimation = ""
        if (option.complete) {
            option.complete()
        }
    }

    // 播放音效
    public async playSound(audioClip: AudioClip) {
        const audioSource = this.node.getChildByName("EffectSound").getComponent(AudioSource)
        audioSource.clip = audioClip
        audioSource.play()
    }

    // 帧间事件
    protected update(dt: number): void {
        if (this.isReady) {
            // 处理buff
            this.character.buffs.forEach(buff => buff.proto.tick(dt))
        }
    }

}


