import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasSound')
export class ScenesMainCanvasSound extends Component {
    
    @property(AudioSource)
    protected getAwardSound: AudioSource = null;

    playGetAwardSound() {
        // 播放获得奖励的音效
        this.getAwardSound.play();
    }

}


