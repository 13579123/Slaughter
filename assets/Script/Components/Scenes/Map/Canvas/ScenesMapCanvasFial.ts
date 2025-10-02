import { _decorator, Color, Component, director, Node, Sprite } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasFial')
export class ScenesMapCanvasFial extends ExtensionComponent {

    public plaFialAnimation() {
        const sprite = this.node.getChildByName("Sprite").getComponent(Sprite)
        sprite.color = new Color(0, 0, 0 , 0)
        this.setAutoInterval(() => {
            sprite.color = new Color(0, 0, 0, sprite.color.a + 10)
        } , {count: 25 , timer: 20})
    }

    protected returnToMain() {
        director.loadScene("Main");
    }

}


