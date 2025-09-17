import { _decorator, Component, Label, Node } from 'cc';
import { resourceManager } from '../../Script/Game/Manager/ResourceManager';
import { Normal } from '../../Script/System/Normal';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

@ccclass('DiamondResourcePrefab')
export class DiamondResourcePrefab extends ExtensionComponent {
    @property(Label)
    protected DiamondNumberLabel: Label

    protected start(): void {
        this.effect(() =>
            this.DiamondNumberLabel.string = Normal.number(resourceManager.data.diamond)
        )
    }
}


