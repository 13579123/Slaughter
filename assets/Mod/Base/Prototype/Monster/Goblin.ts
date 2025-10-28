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

@RegisterLanguageEntry("Goblin")
class Goblin_Entry extends LanguageEntry {
    public get chs(): string { return "哥布林" }
    public get eng(): string { return "Goblin" }
    public get jpn(): string { return "ゴブリン" }
}

@RegisterLanguageEntry("Goblin Description")
class Goblin_Description_Entry extends LanguageEntry {
    public get chs(): string { return "一种在地穴中生活的矮小生物，他们阴险毒辣，喜欢偷袭敌人。" }
    public get eng(): string { return "A small creature that lives in caves, they are cunning and vicious, and enjoy ambushing their enemies." }
    public get jpn(): string { return "洞窟に住む小さな生き物で、狡猾で凶悪であり、敵を待ち伏せするのが好きです。" }
}

@RegisterCharacter("Goblin")
export class Goblin extends CharacterPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Goblin").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("Goblin Description").getValue(settingManager.data.language);
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
        maxHp: 120,
        maxMp: 30,
        physicalAttack: 20,
        magicAttack: 20,
        physicalDefense: 10,
        magicDefense: 10,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 10,
        magicPenetration: 10,
        attackSpeed: 2.0,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 25,
        maxMp: 5,
        physicalAttack: 5,
        magicAttack: 3,
        physicalDefense: 3,
        magicDefense: 3,
    })

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Monster/Goblin/hero00064", sp.SkeletonData, true)).value)
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
                name: "Attack",
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