import { _decorator, Button, Component, find, Label, Node, Prefab, sp, Sprite, UITransform } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { ModuleProgressPrefab } from 'db://assets/Module/Prefabs/ModuleProgressPrefab';
import { Rx } from 'db://assets/Module/Rx';
import { CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { DetailInfoPrefab } from '../DetailInfoPrefab';
import { Normal } from 'db://assets/Script/System/Normal';
const { ccclass, property } = _decorator;

@ccclass('FightCharacterPrefab')
export class FightCharacterPrefab extends ExtensionComponent {

    // 详情界面
    @property(Prefab)
    public DetailPrefab: Prefab = null;

    // 位置
    public pos: "left" | "right";

    // 展示状态
    public showState: boolean = false;

    // 是否准备
    public isReady: boolean = false;

    // 角色数据
    public character: CharacterInstance = null;

    // 帧事件监听
    public frameEvent: Array<(event: sp.spine.Event) => void> = []

    // 绑定角色数据
    public async bindCharacter(character: CharacterInstance , pos: "left" | "right" , showState = true) {
        // 展示状态
        this.showState = showState
        // 设置位置
        this.pos = pos
        // spine节点
        const spine = this.node.getChildByName("Spine")
        // 设置角色数据
        this.character = Rx.reactive(character)
        // 设置位置
        if (pos === "left") spine.setScale(1 , 1)
        else if (pos === "right") spine.setScale(-1 , 1)
        // 绑定帧事件监听
        spine.getComponent(SpineAnimation).setEventListener((ep , event) => {
            if (this.character.proto.animation.frameEvent) {
                if (typeof event === "number") return
                this.character.proto.animation.frameEvent(event.data.name)
                this.frameEvent.forEach(fn => fn(event))
            }
        })
        // 设置spine数据
        const sk = await this.character.proto.skeletonData()
        spine.getComponent(SpineAnimation).skeletonData = sk
        // 右侧mp位置为 25px
        const mpNode = this.node.getChildByName("State").getChildByName("Mp")
        mpNode.setPosition(pos === "right" ? 25 : -25 , mpNode.position.y)
        // 绑定数据展示 
        const mpProgress = this.node.getChildByName("State")
            .getChildByName("Mp").getChildByName("Progress").getComponent(ModuleProgressPrefab)
        const mpLabel = this.node.getChildByName("State")
            .getChildByName("Mp").getChildByName("Label").getComponent(Label)
        const hpProgress = this.node.getChildByName("State")
            .getChildByName("Hp").getChildByName("Progress").getComponent(ModuleProgressPrefab)
        const hpLabel = this.node.getChildByName("State")
            .getChildByName("Hp").getChildByName("Label").getComponent(Label)
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
                const node = new Node
                const uiTransform = node.addComponent(UITransform)
                const sprite = node.addComponent(Sprite)
                node.addComponent(Button)
                uiTransform.setContentSize(35 , 35)
                buffContainer.addChild(node)
                node.on(Button.EventType.CLICK , async () => {
                    const detailNode = CcNative.instantiate(this.DetailPrefab)
                    detailNode.getComponent(DetailInfoPrefab).setDetail({
                        content: [
                            {
                                title: buff.proto.name,
                                rightMessage: buff.proto.description,
                                icon: await buff.proto.icon(),
                                buttons: [],
                            }
                        ],
                        closeCallback: () => find("Canvas").removeChild(detailNode)
                    })
                    find("Canvas").addChild(detailNode)
                })
                sprite.spriteFrame = await buff.proto.icon()
            })
        })
    }

    // 播放角色入场动画
    public async characterEnter() {
        // 初始位置和移动距离
        let startPosx = 0 , xMove = 0
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
        spine.setPosition(startPosx , spine.y)
        spine.getComponent(SpineAnimation).playAnimation(
            this.character.proto.animation.animations.move
        )
        // 移动到指定位置
        const promise = new Promise((res) => {
            const close = this.setAutoInterval(() => {
                startPosx += xMove
                spine.setPosition(startPosx , spine.y)
                if (startPosx === 0) {
                    close()
                    res(null)
                }
            })
        })
        return promise
    }

    // 播放角色进入静止状态
    public async characterReady() {
        // 播放idle动画
        const spine = this.node.getChildByName("Spine")
        spine.getComponent(SpineAnimation).playAnimation(
            this.character.proto.animation.animations.idle,
            {count: -1}
        )
        // 准备
        this.isReady = true
        // 展示状态信息
        if (this.showState)
            this.node.getChildByName("State").active = true
    }

    // 帧间事件
    protected update(dt: number): void {
        if (this.isReady) {
            // 处理buff
            this.character.buffs.forEach(buff => buff.proto.tick(dt))
        }
    }

}


