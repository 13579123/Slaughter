import { _decorator, Component, find, log, Node, Prefab } from 'cc';
import { DetailInfoPrefab } from 'db://assets/Prefabs/Components/DetailInfoPrefab';
import { EquipmentInstance } from '../../../System/Core/Instance/EquipmentInstance';
import { EquipmentQuality } from '../../../System/Core/Prototype/EquipmentPrototype';
import { createPlayerInstance } from '../../../Game/Share';
import { FightPrefab } from 'db://assets/Prefabs/Components/FightPrefab/FightPrefab';
import { CcNative } from 'db://assets/Module/CcNative';
import { Rx } from 'db://assets/Module/Rx';
import { CharacterInstance } from '../../../System/Core/Instance/CharacterInstance';
import { Brave } from 'db://assets/Mod/Base/Prototype/Player/Brave';
import { toRaw } from 'db://assets/Module/Rx/reactivity';
import { getCharacterPrototype } from '../../../System/Manager/CharacterManager';
import { equipmentManager } from '../../../Game/Manager/EquipmentManager';
import { skillManager } from '../../../Game/Manager/SkillManager';
import { characterManager } from '../../../Game/Manager/CharacterManager';
const { ccclass, property } = _decorator;

@ccclass('ScenesMainCanvas')
export class ScenesMainCanvas extends Component {

    async start() {
        // @ts-ignore
        window.testFight = async function(option = {
            left: null , right: null
        }) {
            console.log(skillManager.data.getSkillLevel , skillManager.data.skills)
            const leftCharacter = Rx.reactive(new CharacterInstance({
                lv: option.left?.lv || characterManager.data.lv,
                equipments: option.left?.equipments || equipmentManager.data.equipment,
                skills: option.left?.skills || skillManager.data.skills.map(s => ({lv: skillManager.data.getSkillLevel(s) , prototype: s})),
                buffs: option.left?.buffs || [],
                extraProperty: option.left?.extraProperty || {},
                Proto: getCharacterPrototype(option.left?.prototype) || getCharacterPrototype(characterManager.data.currentCharacter)
            }))
            const rightCharacter = Rx.reactive(new CharacterInstance({
                lv: option.right?.lv || characterManager.data.lv,
                equipments: option.right?.equipments || equipmentManager.data.equipment,
                skills: option.right?.skills || skillManager.data.skills.map(s => ({lv: skillManager.data.getSkillLevel(s) , prototype: s})),
                buffs: option.right?.buffs || [],
                extraProperty: option.right?.extraProperty || {},
                Proto: getCharacterPrototype(option.right?.prototype) || getCharacterPrototype(characterManager.data.currentCharacter)
            }))
            const parent = find("Canvas")
            const fightPrefab = await (new CcNative.Asset.AssetManager("PrefabResource"))
            .load("FightPrefab/FightPrefab" , Prefab)
            const node = CcNative.instantiate(fightPrefab.value)
            parent.addChild(node)
            const successPos = await node.getComponent(FightPrefab)
            .setFightAndStart({
                player: "left",
                leftCharacter: leftCharacter,
                rightCharacter: rightCharacter,
            })
            setTimeout(() => {
                parent.removeChild(node)
            }, 2000);
            console.log(successPos + " 胜利" )
        }
    }

}


