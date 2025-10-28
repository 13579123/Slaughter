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

@RegisterLanguageEntry("Crocodile")
class Crocodile_Entry extends LanguageEntry {
    public get chs(): string { return "鳄鱼" }
    public get eng(): string { return "Crocodile" }
    public get jpn(): string { return "クロコダイル" }
}

@RegisterLanguageEntry("Crocodile Description")
class Crocodile_Description_Entry extends LanguageEntry {
    public get chs(): string { return "沼泽中的凶猛鳄鱼，拥有强大的攻击力。" }
    public get eng(): string { return "A fierce crocodile in the swamp, possessing great attack power." }
    public get jpn(): string { return "沼地にいる凶暴なクロコダイルで、強力な攻撃力を持っています。" }
}

@RegisterCharacter("Crocodile")
export class Crocodile extends CharacterPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Crocodile").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("Crocodile Description").getValue(settingManager.data.language);
    }
    
    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Player/Brave/spriteFrame", SpriteFrame, true)).value)
        })
    }
    
    public get animation(): AnimationConfig {
        return {
            animations: {
                idle: "Idle",
                move: "Run",
            },
        }
    }

    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 180,
        maxMp: 30,
        physicalAttack: 60,
        magicAttack: 15,
        physicalDefense: 12,
        magicDefense: 12,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 10,
        magicPenetration: 10,
        attackSpeed: 0.85,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 40,
        maxMp: 5,
        physicalAttack: 15,
        magicAttack: 2,
        physicalDefense: 3,
        magicDefense: 3,
    })

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Monster/Crocodile/hero00034", sp.SkeletonData, true)).value)
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
