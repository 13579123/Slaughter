import { _decorator, Component, Node, Prefab, Slider } from 'cc';
import { settingManager } from '../../Script/Game/Manager/SettingManager';
import ExtensionComponent from '../../Module/Extension/Component/ExtensionComponent';
import { CcNative } from '../../Module/CcNative';
import { AllLanguageTypeTranslation, LanguageType } from '../../Module/Language/LangaugeType';
import { LoadingManager } from '../../Module/Manager/LoadingManager';
import { ModuleDropListPrefab } from '../../Module/Prefabs/ModuleDropListPrefab';
const { ccclass, property } = _decorator;

@ccclass('SettingPrefab')
export class SettingPrefab extends ExtensionComponent {

    @property(ModuleDropListPrefab)
    protected dropList: ModuleDropListPrefab = null;

    @property(Slider)
    protected backVolumeSlider: Slider = null;

    @property(Slider)
    protected effectVolumeSlider: Slider = null;

    protected start(): void {
        this.dropList.setSelectList({
            multiple: false,
            require: true,
            default: settingManager.data.language,
            // 列表
            list: [
                { key: AllLanguageTypeTranslation["chs"], value: "chs" },
                { key: AllLanguageTypeTranslation["eng"], value: "eng" },
                { key: AllLanguageTypeTranslation["jpn"], value: "jpn" },
            ],
            onchange: (data: LanguageType[]) => {
                const lan = data[0]
                settingManager.data.language = lan
                settingManager.save()
            }
        })
        this.backVolumeSlider.progress = settingManager.data.backVolume
        this.effectVolumeSlider.progress = settingManager.data.effectVolume
    }

    protected backSlider() {
        settingManager.data.backVolume = this.backVolumeSlider.progress
        settingManager.save()
    }

    protected effectSlider() {
        settingManager.data.effectVolume = this.effectVolumeSlider.progress
        settingManager.save()
    }

    protected closeSetting() {
        this.node.active = false
    }

}

// 预加载
LoadingManager.addLoadingQueue(async () => {
    const manager = new CcNative.Asset.AssetManager("PrefabResource")
    await manager.load("SettingPrefab" , Prefab , true)
})