import { _decorator, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { ModuleProgressPrefab } from '../../Script/Module/Prefabs/ModuleProgressPrefab';
import { CharacterInstance } from '../../Script/System/Core/Instance/CharacterInstance';
import { characterManager } from '../../Script/Game/Manager/CharacterManager';
import { ReactiveEffectRunner } from '../../Script/Module/Rx/reactivity';
import { Normal } from '../../Script/System/Normal';

@ccclass('UserBaseDataPrefab')
export class UserBaseDataPrefab extends ExtensionComponent {

    @property(Sprite)
    protected avatar: Sprite = null

    @property(ModuleProgressPrefab)
    protected hpProgress: ModuleProgressPrefab = null

    @property(ModuleProgressPrefab)
    protected mpProgress: ModuleProgressPrefab = null

    @property(ModuleProgressPrefab)
    protected expProgress: ModuleProgressPrefab = null

    @property(Label)
    protected numberLabel: Label = null

    @property(Label)
    protected levelLabel: Label = null

    protected effectList: ReactiveEffectRunner[] = []

    public async bindCharacter(characterInstance: CharacterInstance) {
        this.effectList.forEach(r => r.effect.stop())
        this.effectList = []
        let globalId = 0
        const runner1 = this.effect(() => {
            const id = ++globalId
            characterInstance.proto.icon().then(res => {
                if (globalId === id) this.avatar.spriteFrame = res
            })
        })
        const runner2 = this.effect(() => {
            this.numberLabel.string = `\n${(characterInstance.hp * characterInstance.maxHp).toFixed(0)}/${characterInstance.maxHp}\n` +
            `${Normal.number(characterInstance.mp * characterInstance.maxMp)}/${Normal.number(characterInstance.maxMp)}\n` +
            `${Normal.number(characterManager.data.exp)}/${Normal.number(characterManager.data.maxExp)}\n`
            this.hpProgress.setProgress(characterInstance.hp)
            this.mpProgress.setProgress(characterInstance.mp)
            this.expProgress.setProgress(characterManager.data.exp / characterManager.data.maxExp)
            this.levelLabel.string = characterManager.data.lv + ""
        })
        this.effectList.push(runner1 , runner2)
    }

}
