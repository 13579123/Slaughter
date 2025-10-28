import { _decorator, Component, Node } from 'cc';
import { ModuleDropListPrefab } from 'db://assets/Module/Prefabs/ModuleDropListPrefab';
import { levelDataManager } from 'db://assets/Script/Game/Manager/LevelDataManager';
import { enterFightMap } from 'db://assets/Script/Game/System/Manager/FightMapManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasLevelSelect')
export class ScenesMainCanvasLevelSelect extends Component {

    @property(ModuleDropListPrefab)
    protected dropListLevelSelect: ModuleDropListPrefab = null;

    // 初始化
    protected start(): void {
        this.initMainLevelList()
    }

    // 当前选择的主关卡
    protected currentMainLevel: number = 1;

    // 初始化主关卡列表
    protected initMainLevelList() {
        this.dropListLevelSelect.setSelectList({
            multiple: false,
            require: true,
            default: 1,
            // 列表
            list: [
                { key: "1层", value: 1 },
                levelDataManager.data.mainLevelFloor > 20 ? { key: "21层", value: 21 } : void 0,
                levelDataManager.data.mainLevelFloor > 40 ? { key: "41层", value: 41 } : void 0,
                levelDataManager.data.mainLevelFloor > 60 ? { key: "61层", value: 61 } : void 0,
                levelDataManager.data.mainLevelFloor > 80 ? { key: "81层", value: 81 } : void 0,
            ].filter(v => v),
            onchange: (data: number[]) => {
                this.currentMainLevel = data[0]; // 当前选择
            }
        })
    }

    // 进入关卡
    protected enterMainLevel() {
        enterFightMap("MainLevelData" , {customData: {floor: this.currentMainLevel}})
    }

    // 关闭回调
    protected closeLevelSelect() {
        this.node.active = false;
    }

}


