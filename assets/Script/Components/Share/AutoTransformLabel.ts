import { _decorator, Component, Label, Node } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { LanguageManager } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from '../../Game/Manager/SettingManager';
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
