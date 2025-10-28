import { AudioClip, sp, SpriteFrame } from "cc";
import { settingManager } from "db://assets/Script/Game/Manager/SettingManager";
import { CcNative } from "db://assets/Module/CcNative";
import { LanguageEntry } from "db://assets/Module/Language/LanguageEntry";
import { LanguageManager, RegisterLanguageEntry } from "db://assets/Module/Language/LanguageManager";
import { BasePrototypeProperty } from "db://assets/Script/System/Core/Property/BasePrototypeProperty";
import { AnimationConfig, CharacterPrototype } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { RegisterCharacter } from "db://assets/Script/System/Manager/CharacterManager";
import { getComponentByCharacter } from "db://assets/Script/Game/System/CharacterToPrefabMap";
import { AttackProgress, DeathProgress, SkillProgress } from "db://assets/Script/System/Core/Progress/FightProgress";

@RegisterLanguageEntry("DefectorSoldier")
class DefectorSoldier_Entry extends LanguageEntry {
    public get chs(): string { return "叛变的士兵" }
    public get eng(): string { return "Defector Soldier" }
    public get jpn(): string { return "脱走兵" }
}

@RegisterLanguageEntry("DefectorSoldier Description")
class DefectorSoldier_Description_Entry extends LanguageEntry {
    public get chs(): string { return "叛变的士兵" }
    public get eng(): string { return "A soldier who has defected from his army, they are cunning and vicious, and enjoy ambushing their enemies." }
    public get jpn(): string { return "軍隊から脱走した兵士で、狡猾で凶悪であり、敵を待ち伏せするのが好きです。" }
}

@RegisterCharacter("DefectorSoldier")
export class DefectorSoldier extends CharacterPrototype {

    public get name(): string {
        return LanguageManager.getEntry("DefectorSoldier").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("DefectorSoldier Description").getValue(settingManager.data.language);
    }
    
    public get animation(): AnimationConfig {
        return {
            animations: {
                idle: "Idle",
                move: "Run",
            },
        }
    }
    
    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Player/Brave/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 250,
        maxMp: 30,
        physicalAttack: 20,
        magicAttack: 15,
        physicalDefense: 18,
        magicDefense: 18,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 10,
        magicPenetration: 10,
        lightResistance: 25,
        darkResistance: -25,
        attackSpeed: 0.75,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 70,
        maxMp: 10,
        physicalAttack: 4,
        magicAttack: 3,
        physicalDefense: 8,
        magicDefense: 8,
    })

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Monster/DefectorSoldier/hero0007", sp.SkeletonData, true)).value)
        })
    }

    playAttackAnimation(progress: AttackProgress, animationEndCallback: Function, next: Function) {
        const prefab = getComponentByCharacter(this.instance)
        if (!prefab) return next()
        prefab.playAnimation("Attack01", {
            count: 1,
            speed: this.instance.attackSpeed,
            frameEvent: {
                name: "Attack",
                callback: () => {
                    next()
                    // 播放音效
                    new CcNative.Asset.AssetManager("ModBaseResource")
                    .load("Sound/Character/Player/atk1" , AudioClip)
                    .then((audio) => prefab.playSound(audio.value))
                }
            },
            complete: () => animationEndCallback()
        })
        return
    }
    playSkillAnimation(progress: SkillProgress, animationEndCallback: Function, next: Function) {
        const prefab = getComponentByCharacter(this.instance)
        if (!prefab) return next()
        prefab.playAnimation("Attack02", {
            count: 1,
            speed: 1,
            frameEvent: {
                name: "Skill",
                callback: () => next()
            },
            complete: () => animationEndCallback()
        })
    }
    public playDieAnimation(progress: DeathProgress, animationEndCallback: Function , next: Function): void {
        const prefab = getComponentByCharacter(this.instance)
        if (!prefab) return
        prefab.playAnimation("BeAttack", {
            count: 1,
            speed: 1,
            complete: () => {
                animationEndCallback() 
                next()
            }
        })
    }

}
