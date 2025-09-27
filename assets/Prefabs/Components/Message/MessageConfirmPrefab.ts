import { _decorator, Component, Label, Node } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

@ccclass('MessageConfirmPrefab')
export class MessageConfirmPrefab extends ExtensionComponent {

    protected onConfirm: Function = null

    protected onCancel: Function = null

    public setConfirm(title: string , msg: string , confirm: string , cancel: string , onConfirm: Function , onCancel: Function) {
        const box = this.node.getChildByName("SettingBack")
        box.getChildByName("Title").getComponent(Label).string = title
        box.getChildByName("Message").getComponent(Label).string = msg
        box.getChildByName("Confirm").getChildByName("Label").getComponent(Label).string = confirm
        box.getChildByName("Cancel").getChildByName("Label").getComponent(Label).string = cancel
        this.onConfirm = onConfirm
        this.onCancel = onCancel
    }

    protected clickConfirm() {
        if (this.onConfirm) {
            this.onConfirm()
        }
    }

    protected clickCancel() {
        if (this.onCancel) {
            this.onCancel()
        }
    }

}


