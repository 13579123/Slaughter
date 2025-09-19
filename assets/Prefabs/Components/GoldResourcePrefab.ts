import { _decorator, Component, Label, Node } from 'cc';
import { resourceManager } from '../../Script/Game/Manager/ResourceManager';
import { Normal } from '../../Script/System/Normal';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

@ccclass('GoldResourcePrefab')
export class GoldResourcePrefab extends ExtensionComponent {

    @property(Label)
    protected GoldNumberLabel: Label

    protected start(): void {
        this.effect(() => {
            this.GoldNumberLabel.string = Normal.number(resourceManager.data.gold)
        })
    }

}


