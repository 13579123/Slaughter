import { _decorator, Component, find, Node, Prefab } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager } from 'db://assets/Module/Language/LanguageManager';
import { BackpackPrefab } from 'db://assets/Prefabs/Components/BackpackPrefab';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { message } from 'db://assets/Script/Game/Message/Message';
import { exitFightMap } from 'db://assets/Script/Game/System/Manager/FightMapManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasUi')
export class ScenesMapCanvasUi extends Component {

    // 背包预制体
    @property(Prefab)
    protected backpackPrefab: Prefab = null;

    @property(Node)
    protected placeholderNode: Node = null;

    // 开启设置
    protected async openSetting() {
        const manager = new CcNative.Asset.AssetManager("PrefabResource")
        const settingPrefab = await manager.load("SettingPrefab", Prefab, true)
        const settingNode = CcNative.instantiate(settingPrefab.value)
        find("Canvas").addChild(settingNode)
    }

    // 开启背包
    protected async openBagpack() {
        const node = CcNative.instantiate(this.backpackPrefab)
        node.getComponent(BackpackPrefab).onClose(() => {
            if (node && node.isValid) node.destroy()
        })
        this.placeholderNode.addChild(node)
    }

    protected async leaveMap() {
        // 确认离开地图
        const confirm = await message.confirm(
            (new class extends LanguageEntry {
                public get chs(): string {
                    return "提示"
                }
                public get eng(): string {
                    return "Hint"
                }
                public get jpn(): string {
                    return "ヒント"
                }
            }).getValue(settingManager.data.language),
            (new class extends LanguageEntry {
                public get chs(): string {
                    return "是否要离开本关卡？"
                }
                public get eng(): string {
                    return "Do you want to leave this level?"
                }
                public get jpn(): string {
                    return "本レベルを離れますか？"
                }
            }).getValue(settingManager.data.language),
            LanguageManager.getEntry("Confirm").getValue(settingManager.data.language),
            LanguageManager.getEntry("Cancel").getValue(settingManager.data.language),
        )
        // 下一关
        if (!confirm) return
        // 离开关卡
        exitFightMap()
    }

}
