import { _decorator, Component, Node, v2 } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { UserBaseDataPrefab } from 'db://assets/Prefabs/Components/UserBaseDataPrefab';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
import { mapHeight, mapWidth } from './ScenesMapCanvasMap';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasPlayer')
export class ScenesMapCanvasPlayer extends ExtensionComponent {

    // 虚空背景
    @property(Node)
    protected emptyBackground: Node = null;

    // 角色数据预制体
    @property(UserBaseDataPrefab)
    protected userBaseDataPrefab: UserBaseDataPrefab = null;

    // 战斗数据实例
    protected instance = getFightMapInstance()

    // 虚拟坐标
    public virtualPosition = v2(mapWidth / 2, -mapHeight / 2)

    // 开始
    protected start() {
        // 绑定角色数据
        this.userBaseDataPrefab.bindCharacter(this.instance.player)
    }

    // // 每一帧
    // protected update(deltaTime: number) {
    //     // 同步背景
    //     this.emptyBackground.setPosition(this.node.position.x , this.node.position.y)
    // }

    // 角色移动
    public async movePlayer(type: "up" | "down" | "left" | "right") {
        switch (type) {
            case "up": {
                return new Promise(res => {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x, this.virtualPosition.y + mapHeight / 30)
                    }, { timer: 10, count: 30, complete: () => {
                        this.instance.playerPosition.y -= 1
                        res(null)
                    } })
                })
            }
            case "down": {
                return new Promise(res => {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x, this.virtualPosition.y - mapHeight / 30)
                    }, { timer: 10, count: 30, complete: () => {
                        this.instance.playerPosition.y += 1
                        res(null)
                    } })
                })
            }
            case "left": {
                return new Promise(res => {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x - mapWidth / 30, this.virtualPosition.y)
                    }, { timer: 10, count: 30, complete: () => {
                        this.instance.playerPosition.x -= 1
                        res(null)
                    } })
                })
            }
            case "right": {
                return new Promise(res => {
                    this.setAutoInterval(() => {
                        this.virtualPosition = v2(this.virtualPosition.x + mapWidth / 30, this.virtualPosition.y)
                    }, { timer: 10, count: 30, complete: () => {
                        this.instance.playerPosition.x += 1
                        res(null)
                    } })
                })
            }
        }
        // switch (type) {
        //     case "up": {
        //         return new Promise(res => {
        //             this.setAutoInterval(() => {
        //                 this.node.setPosition(this.node.position.x, this.node.position.y + mapHeight / 30)
        //             }, { timer: 10, count: 30, complete: () => {
        //                 this.instance.playerPosition.y -= 1
        //                 res(null)
        //             } })
        //         })
        //     }
        //     case "down": {
        //         return new Promise(res => {
        //             this.setAutoInterval(() => {
        //                 this.node.setPosition(this.node.position.x, this.node.position.y - mapHeight / 30)
        //             }, { timer: 10, count: 30, complete: () => {
        //                 this.instance.playerPosition.y += 1
        //                 res(null)
        //             } })
        //         })
        //     }
        //     case "left": {
        //         return new Promise(res => {
        //             this.setAutoInterval(() => {
        //                 this.node.setPosition(this.node.position.x - mapWidth / 30, this.node.position.y)
        //             }, { timer: 10, count: 30, complete: () => {
        //                 this.instance.playerPosition.x -= 1
        //                 res(null)
        //             } })
        //         })
        //     }
        //     case "right": {
        //         return new Promise(res => {
        //             this.setAutoInterval(() => {
        //                 this.node.setPosition(this.node.position.x + mapWidth / 30, this.node.position.y)
        //             }, { timer: 10, count: 30, complete: () => {
        //                 this.instance.playerPosition.x += 1
        //                 res(null)
        //             } })
        //         })
        //     }
        // }
    }

}


