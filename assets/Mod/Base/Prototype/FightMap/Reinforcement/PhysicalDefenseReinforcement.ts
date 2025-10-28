import { SpriteFrame } from "cc"
import { CcNative } from "db://assets/Module/CcNative"
import { getFightMapInstance } from "db://assets/Script/Game/System/Manager/FightMapManager"
import { ReinforcementDTO } from "db://assets/Script/Game/System/Prototype/FightMapPrototype"

export const PhysicalDefenseReinforcement: ReinforcementDTO= {
    icon: async () => {
        return (await new CcNative.Asset.AssetManager("ModBaseResource").load(
            "Texture/FightMap/Reinforcement/PhysicalDefenseReinforcement/spriteFrame" , SpriteFrame
        )).value
    },
    property: () => {
        const fightInstance = getFightMapInstance()
        if (!fightInstance) return {}
        return {
            physicalDefense: fightInstance.player.physicalDefense * 0.01, // 1% max physicalDefense
        }
    }
}
