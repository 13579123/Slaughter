import { _decorator, Component, Node, v2 } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { UserBaseDataPrefab } from 'db://assets/Prefabs/Components/UserBaseDataPrefab';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
import { mapHeight, mapWidth } from './ScenesMapCanvasMap';
import { SpineAnimation } from 'db://assets/Module/Extension/Component/SpineAnimation';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasPlayer')
export class ScenesMapCanvasPlayer extends ExtensionComponent {

    // 虚空背景
    @property(Node)
    protected emptyBackground: Node = null;

    // 角色数据预制体
    @property(UserBaseDataPrefab)
    protected userBaseDataPrefab: UserBaseDataPrefab = null;

    // spineAnimation 实例
    public spineAnimation: SpineAnimation = null;

    // 战斗数据实例
    protected instance = getFightMapInstance()

    // 虚拟坐标
    public virtualPosition = v2(mapWidth / 2, -mapHeight / 2)

    // 开始
    protected start() {
        // 绑定角色数据
        this.userBaseDataPrefab.bindCharacter(this.instance.player)
        // 绑定角色spine
        this.spineAnimation = this.node.getChildByName("Spine").getComponent(SpineAnimation)
        this.instance.player.proto.skeletonData().then((skele) => {
            this.spineAnimation.skeletonData = skele
            this.spineAnimation.playAnimation(this.instance.player.proto.animation.animations.idle)
        })
    }

    // 角色移动
    public async movePlayer(type: "up" | "down" | "left" | "right") {
        return new Promise(res => {
            switch (type) {
                case "up": {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x, this.virtualPosition.y + mapHeight / 30)
                    }, {
                        timer: 10, count: 30, complete: () => {
                            this.instance.playerPosition.y -= 1
                            res(null)
                        }
                    })
                    break
                }
                case "down": {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x, this.virtualPosition.y - mapHeight / 30)
                    }, {
                        timer: 10, count: 30, complete: () => {
                            this.instance.playerPosition.y += 1
                            res(null)
                        }
                    })
                    break
                }
                case "left": {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x - mapWidth / 30, this.virtualPosition.y)
                    }, {
                        timer: 10, count: 30, complete: () => {
                            this.instance.playerPosition.x -= 1
                            res(null)
                        }
                    })
                    break
                }
                case "right": {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x + mapWidth / 30, this.virtualPosition.y)
                    }, {
                        timer: 10, count: 30, complete: () => {
                            this.instance.playerPosition.x += 1
                            res(null)
                        }
                    })
                    break
                }
            }
            return
        })
    }

}


