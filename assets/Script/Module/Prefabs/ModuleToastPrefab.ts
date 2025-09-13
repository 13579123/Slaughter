import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import ExtensionComponent from '../Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

@ccclass('ModuleToastPrefab')
export class ModuleToastPrefab extends ExtensionComponent {

    @property(Label)
    protected label: Label | null = null;

    public async setToast(message: string, duration: number = 1500) {
        if (duration <= 600) duration = 600
        const sprite = this.node.getComponent(Sprite)
        this.label.string = message
        let posY = -20
        let a = 0
        sprite.color = new Color(255, 255, 255, a)
        this.node.setPosition(this.node.position.x, posY, this.node.position.z)
        await new Promise(res => {
            this.setAutoInterval(() => {
                posY += 1
                sprite.color = new Color(255, 255, 255, a += 12.75)
                this.node.setPosition(this.node.position.x, posY, this.node.position.z)
            } , {timer: 15 , count: 20 , complete: () => res(0)})
        })
        await new Promise(res => setTimeout(res , Math.max(duration - 400 , 10)))
        await new Promise(res => {
            this.setAutoInterval(() => {
                posY -= 1
                sprite.color = new Color(255, 255, 255, a -= 12.75)
                this.node.setPosition(this.node.position.x, posY, this.node.position.z)
            } , {timer: 15 , count: 20 , complete: () => res(0)})
        })
    }

}


