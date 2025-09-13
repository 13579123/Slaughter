import { _decorator, Component, Label, Node } from 'cc';
import { Extension } from '../../Script/Module/Extension';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { resourceManager } from '../../Script/Game/Manager/ResourceManager';
import { Normal } from '../../Script/System/Normal';
const { ccclass, property } = _decorator;

@ccclass('GoldResourcePrefab')
export class GoldResourcePrefab extends ExtensionComponent {

    @property(Label)
    protected GoldNumberLabel: Label

    protected start(): void {
        this.effect(() => 
            this.GoldNumberLabel.string = Normal.number(resourceManager.data.gold)
        )
    }

}


