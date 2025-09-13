import { _decorator, Component, Label, Node } from 'cc';
import { Rx } from '../../Module/Rx';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
import { settingManager } from '../../Game/Manager/SettingManager';
import { LanguageManager } from '../../Module/Language/LanguageManager';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('AutoTransformLabel')
@requireComponent(Label)
export class AutoTransformLabel extends ExtensionComponent {

    protected label: Label

    protected onLoad(): void {
        this.label = this.node.getComponent(Label)
        const key = this.label.string
        this.effect(() => {
            this.label.string =
                LanguageManager.getEntry(key).getValue(settingManager.data.language)
        })
    }

}
