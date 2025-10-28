import { SpriteFrame } from "cc"
import { CcNative } from "db://assets/Module/CcNative"
import { getFightMapInstance } from "db://assets/Script/Game/System/Manager/FightMapManager"
import { ReinforcementDTO } from "db://assets/Script/Game/System/Prototype/FightMapPrototype"

export const MagicDefenseReinforcement: ReinforcementDTO= {
    icon: async () => {
        return (await new CcNative.Asset.AssetManager("ModBaseResource").load(
            "Texture/FightMap/Reinforcement/MagicDefenseReinforcement/spriteFrame" , SpriteFrame
        )).value
    },
    property: () => {
        const fightInstance = getFightMapInstance()
        if (!fightInstance) return {}
        return {
            magicDefense: fightInstance.player.magicDefense * 0.01, // 1% max physicalDefense
        }
    }
}
