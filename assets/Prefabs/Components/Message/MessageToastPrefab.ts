import { _decorator, Component, Node } from 'cc';
import { ModuleToastPrefab } from 'db://assets/Module/Prefabs/ModuleToastPrefab';
const { ccclass, property } = _decorator;

@ccclass('MessageToastPrefab')
export class MessageToastPrefab extends Component {

    @property(ModuleToastPrefab)
    protected toastPrefab: ModuleToastPrefab = null;

    public async setToast(message: string, duration: number = 1500) {
        await this.toastPrefab.setToast(message, duration);
    }

}


