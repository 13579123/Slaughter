import { SpriteFrame } from "cc"
import { CcNative } from "db://assets/Module/CcNative"
import { getFightMapInstance } from "db://assets/Script/Game/System/Manager/FightMapManager"
import { ReinforcementDTO } from "db://assets/Script/Game/System/Prototype/FightMapPrototype"

export const MaxHpReinforcement: ReinforcementDTO= {
    icon: async () => {
        return (await new CcNative.Asset.AssetManager("ModBaseResource").load(
            "Texture/FightMap/Reinforcement/MaxHpReinforcement/spriteFrame" , SpriteFrame
        )).value
    },
    property: () => {
        const fightInstance = getFightMapInstance()
        if (!fightInstance) return {}
        return {
            maxHp: fightInstance.player.maxHp * 0.01, // 1% max hp
        }
    }
}
