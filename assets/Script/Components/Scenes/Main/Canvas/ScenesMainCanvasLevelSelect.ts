import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasLevelSelect')
export class ScenesMainCanvasLevelSelect extends Component {

    // 关闭回调
    protected closeLevelSelect() {
        this.node.active = false;
    }

}


