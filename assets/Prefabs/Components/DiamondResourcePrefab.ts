import { _decorator, Component, Label, Node } from 'cc';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
import { resourceManager } from '../../Script/Game/Manager/ResourceManager';
import { Normal } from '../../Script/System/Normal';
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


