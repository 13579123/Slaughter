import { _decorator, Component, Node } from 'cc';
import { UserBaseDataPrefab } from 'db://assets/Prefabs/Components/UserBaseDataPrefab';
import { characterManager } from 'db://assets/Script/Game/Manager/CharacterManager';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { createPlayerInstance } from 'db://assets/Script/Game/Share';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { Rx } from 'db://assets/Module/Rx';
import { CharacterInstance } from 'db://assets/Script/System/Core/Instance/CharacterInstance';
import { getCharacterPrototype } from 'db://assets/Script/System/Manager/CharacterManager';
import { getSkillKey, getSkillPrototype } from 'db://assets/Script/System/Manager/SkillManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvasData')
export class ScenesMainCanvasData extends ExtensionComponent {

    @property(UserBaseDataPrefab)
    protected userBaseData: UserBaseDataPrefab = null

    protected start() {
        let character: CharacterInstance
        this.effect(() => {
            // 根据本地信息生成角色对象
            character = Rx.reactive(createPlayerInstance())
            // @ts-ignore
            window.character = character
            // 绑定渲染器
            this.userBaseData.bindCharacter(character , false)
        })
        return
    }

}


