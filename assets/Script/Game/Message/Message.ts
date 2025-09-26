import { find, log, Prefab } from "cc";
import { CcNative } from "db://assets/Module/CcNative";
import { CcAssetManager } from "db://assets/Module/CcNative/Asset/AssetManager";
import { MessageToastPrefab } from "db://assets/Prefabs/Components/Message/MessageToastPrefab";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { MessageCongratulationsPrefab } from "db://assets/Prefabs/Components/Message/MessageCongratulationsPrefab";
import { AchivementPrototype } from "../System/Prototype/AchivementPrototype";
import { MessageTaskNotifyPrefab } from "db://assets/Prefabs/Components/Message/MessageTaskNotifyPrefab";

class Message {

    // 弹框消息
    protected ToastPrefab: Prefab = null;

    // 弹框消息
    public async toast(msg: string) {
        if (!this.ToastPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageToastPrefab" , Prefab)
            this.ToastPrefab = prefab.value;
        }
        const node = CcNative.instantiate(this.ToastPrefab)
        const parent = find("Canvas")
        parent.addChild(node)
        node.getComponent(MessageToastPrefab).setToast(msg)
        .then(_ => {
            parent.removeChild(node)
            if (node.isValid) node.destroy()
        })
    }

    // 恭喜预制体
    protected CongratulationsPrefab: Prefab = null;

    // 恭喜
    public async congratulations(gold: number , diamond: number , items: ItemDTO[] , equipments: EquipmentDTO[]) {
        if (!this.CongratulationsPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageCongratulationsPrefab" , Prefab)
            this.CongratulationsPrefab = prefab.value;
        }
        const node = CcNative.instantiate(this.CongratulationsPrefab)
        const parent = find("Canvas")
        parent.addChild(node)
        node.getComponent(MessageCongratulationsPrefab)
        .setCongratulation(gold , diamond , items , equipments , () => {
            parent.removeChild(node)
            if (node.isValid) node.destroy()
        })
    }

    // 任务完成提示
    protected TaskNotifyPrefab: Prefab = null;

    public async taskNotify(achivement: AchivementPrototype) {
        if (!this.TaskNotifyPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageTaskNotifyPrefab" , Prefab)
            this.TaskNotifyPrefab = prefab.value;
        }
        const node = CcNative.instantiate(this.TaskNotifyPrefab)
        const parent = find("Canvas")
        parent.addChild(node)
        node.getComponent(MessageTaskNotifyPrefab).setNotifyInfo(achivement)
        .then(() => {
            parent.removeChild(node)
        })
    }

}

export const message = new Message();