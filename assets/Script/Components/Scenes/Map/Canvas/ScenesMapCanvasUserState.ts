import { _decorator, Component, Node } from 'cc';
import ExtensionComponent from 'db://assets/Module/Extension/Component/ExtensionComponent';
import { Rx } from 'db://assets/Module/Rx';
import { UserBaseDataPrefab } from 'db://assets/Prefabs/Components/UserBaseDataPrefab';
import { equipmentManager } from 'db://assets/Script/Game/Manager/EquipmentManager';
import { getFightMapInstance } from 'db://assets/Script/Game/System/Manager/FightMapManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMapCanvasUserState')
export class ScenesMapCanvasUserState extends ExtensionComponent {
    
    // 角色数据预制体
    @property(UserBaseDataPrefab)
    protected userBaseDataPrefab: UserBaseDataPrefab = null;
    
    // 战斗数据实例
    protected instance = getFightMapInstance()

    protected start() {
        // 绑定角色数据并且监听装备变化
        this.effect(() => this.userBaseDataPrefab.bindCharacter(this.instance.player))
        this.effect(() => {
            Object.keys(equipmentManager.data.equipment).forEach(key => equipmentManager.data.equipment[key])
            const hp = Rx.toRaw(this.instance).player.hp
            const mp = Rx.toRaw(this.instance).player.mp
            const player = this.instance.createPlayerInstance()
            player.hp = hp
            player.mp = mp
            this.instance.player = player
        })
    }

}


