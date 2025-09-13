import { _decorator, Component, Node } from 'cc';
import { Extension } from '../../Script/Module/Extension';
import ExtensionComponent from '../../Script/Module/Extension/Component/ExtensionComponent';
const { ccclass, property } = _decorator;

export type DetailInfoSetOption = {
    content: { title: string , detail: string }[],
    buttons?: { label: string , callback: () => void }[],
}

@ccclass('DetailInfoPrefab')
export class DetailInfoPrefab extends ExtensionComponent {

    public setDetail(option: DetailInfoSetOption) {

    }

    protected closeDetail() {
        
    }

}


