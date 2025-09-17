import { _decorator, Component, Node, sp } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
import { Rx } from 'db://assets/Module/Rx';
import { CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
const { ccclass, property } = _decorator;

@ccclass('FightCharacterPrefab')
export class FightCharacterPrefab extends ExtensionComponent {

    // 位置
    public pos: "left" | "right";

    // 角色数据
    public character: CharacterInstance = null;

    // 帧事件监听
    public frameEvent: Array<(event: sp.spine.Event) => void> = []

    // 绑定角色数据
    public async bindCharacter(character: CharacterInstance , pos: "left" | "right") {
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
        const spine = this.node.getChildByName("Spine")
        spine.getComponent(SpineAnimation).playAnimation(
            this.character.proto.animation.animations.idle,
            {count: -1}
        )
        // 展示状态信息
        this.node.getChildByName("State").active = true
    }

}


