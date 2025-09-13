import { _decorator, Color, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScenesLoadingCanvasLogo')
export class ScenesLoadingCanvasLogo extends Component {

    protected sprite: Sprite;

    protected start(): void {
        this.sprite = this.node.getComponent(Sprite);
        this.sprite.color = new Color(255, 255, 255, 0);
    }

    protected update(dt: number): void {
        this.sprite.color = new Color(255, 255, 255, this.sprite.color.a + dt * 100);
    }

}


