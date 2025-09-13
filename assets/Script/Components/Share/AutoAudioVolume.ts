import { _decorator, AudioSource, Component, Enum, Node } from 'cc';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
import { settingManager } from '../../Game/Manager/SettingManager';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('AutoAudioVolume')
export class AutoAudioVolume extends ExtensionComponent {

    @property({type: Enum({
        Back: 0,
        Effect: 1
    })})
    protected audioType: number = 0;

    protected start(): void {
        this.effect(() => {
            if (this.audioType === 0) {
                this.node.getComponent(AudioSource).volume = settingManager.data.backVolume
            } else {
                this.node.getComponent(AudioSource).volume = settingManager.data.effectVolume
            }
        })
    }

}