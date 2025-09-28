import { find, log, Prefab } from "cc";
import { CcNative } from "db://assets/Module/CcNative";
import { CcAssetManager } from "db://assets/Module/CcNative/Asset/AssetManager";
import { MessageToastPrefab } from "db://assets/Prefabs/Components/Message/MessageToastPrefab";
import { ItemDTO } from "../../System/Core/Prototype/ItemPrototype";
import { EquipmentDTO } from "../../System/Core/Prototype/EquipmentPrototype";
import { MessageCongratulationsPrefab } from "db://assets/Prefabs/Components/Message/MessageCongratulationsPrefab";
import { AchivementPrototype } from "../System/Prototype/AchivementPrototype";
import { MessageTaskNotifyPrefab } from "db://assets/Prefabs/Components/Message/MessageTaskNotifyPrefab";
import { MessageConfirmPrefab } from "db://assets/Prefabs/Components/Message/MessageConfirmPrefab";
import { LoadingManager } from "db://assets/Module/Manager/LoadingManager";

class Message {

    // 弹框消息
    protected ToastPrefab: Prefab = null;

    // 预加载
    public async preloadToast() {
        if (!this.ToastPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageToastPrefab" , Prefab)
            this.ToastPrefab = prefab.value;
        }
    }

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

    // 预加载
    public async preloadCongratulations() {
        if (!this.CongratulationsPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageCongratulationsPrefab" , Prefab)
            this.CongratulationsPrefab = prefab.value;
        }
    }

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

    // 预加载
    public async preloadTaskNotify() {
        if (!this.TaskNotifyPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageTaskNotifyPrefab" , Prefab)
            this.TaskNotifyPrefab = prefab.value;
        }
    }

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

    // 确认弹窗
    protected ConfirmPrefab: Prefab = null;

    // 预加载
    public async preloadConfirm() {
        if (!this.ConfirmPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageConfirmPrefab" , Prefab)
            this.ConfirmPrefab = prefab.value;
        }
    }

    public async confirm(title: string , message: string , confirm: string , cancel: string): Promise<boolean> {
        if (!this.ConfirmPrefab) {
            const assetManager = new CcNative.Asset.AssetManager("PrefabResource")
            const prefab = await assetManager.load("Message/MessageConfirmPrefab" , Prefab)
            this.ConfirmPrefab = prefab.value;
        }
        const node = CcNative.instantiate(this.ConfirmPrefab)
        const parent = find("Canvas")
        parent.addChild(node)
        return new Promise<boolean>(res => {
            node.getComponent(MessageConfirmPrefab).setConfirm(title, message, confirm, cancel, () => {
                res(true)
                parent.removeChild(node)
                node.destroy()
            } , () => {
                res(false)
                parent.removeChild(node)
                node.destroy()
            })
        })
    }

}

export const message = new Message();

LoadingManager.addLoadingQueue(async () => {
    await message.preloadToast();
})

LoadingManager.addLoadingQueue(async () => {
    await message.preloadCongratulations();
})

LoadingManager.addLoadingQueue(async () => {
    await message.preloadTaskNotify();
})

LoadingManager.addLoadingQueue(async () => {
    await message.preloadConfirm();
})