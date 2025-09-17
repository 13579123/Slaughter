import { _decorator, Component, director, Label, Node } from 'cc';
import { LoadingManager } from 'db://assets/Module/Manager/LoadingManager';
import { ModuleProgressPrefab } from 'db://assets/Module/Prefabs/ModuleProgressPrefab';
const { ccclass, property } = _decorator;

@ccclass('ScenesLoadingCanvas')
export class ScenesLoadingCanvas extends Component {

    @property(Label)
    protected progressLabel: Label

    @property(ModuleProgressPrefab)
    protected progress: ModuleProgressPrefab

    protected start(): void {
        this.progress.setProgress(0 , true)
        this.progress.on("update" , (progress: number) => 
            this.progressLabel.string = (progress * 100).toFixed(1) + "%"
        )
        LoadingManager.excuteLoadingQueue({
            stage: (current , max) => this.onStage(current , max),
            loaded: () => this.onLoaded(),
        })
    }

    protected onStage(current: number , max: number) {
        this.progress.setProgress(current / max)
    }

    protected onLoaded() {
        this.progress.setProgress(1)
        this.progress.on("complete" , () => director.loadScene("Main"))
    }

}
