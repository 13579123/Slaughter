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

@RegisterLanguageEntry("SkeletonSoldier")
class SkeletonSoldier_Entry extends LanguageEntry {
    public get chs(): string { return "骷髅士兵" }
    public get eng(): string { return "Skeleton Soldier" }
    public get jpn(): string { return "スケルトン兵士" }
}

@RegisterLanguageEntry("SkeletonSoldier Description")
class SkeletonSoldier_Description_Entry extends LanguageEntry {
    public get chs(): string { return "一种由黑暗魔法复活的骷髅战士，他们无畏死亡，永远忠诚于他们的主人。" }
    public get eng(): string { return "A skeleton warrior resurrected by dark magic, they fear no death and are forever loyal to their master." }
    public get jpn(): string { return "闇の魔法によって復活したスケルトン戦士で、死を恐れず、主人に永遠に忠実です。" }
}   

@RegisterCharacter("SkeletonSoldier")
export class SkeletonSoldier extends CharacterPrototype {

    public get name(): string {
        return LanguageManager.getEntry("SkeletonSoldier").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("SkeletonSoldier Description").getValue(settingManager.data.language);
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
        maxHp: 150,
        maxMp: 30,
        physicalAttack: 35,
        magicAttack: 20,
        physicalDefense: 10,
        magicDefense: 10,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 10,
        magicPenetration: 10,
        lightResistance: -25,
        darkResistance: 25,
        attackSpeed: 1.2,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 30,
        maxMp: 5,
        physicalAttack: 5,
        magicAttack: 3,
        physicalDefense: 3,
        magicDefense: 3,
    })

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Monster/SkeletonSoldier/hero00023", sp.SkeletonData, true)).value)
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