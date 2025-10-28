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

@RegisterLanguageEntry("Brave")
class Brave_Entry extends LanguageEntry {
    public get chs(): string { return "勇者" }
    public get eng(): string { return "Brave" }
    public get jpn(): string { return "勇者" }
}

@RegisterLanguageEntry("Brave Description")
class Brave_Description_Entry extends LanguageEntry {
    public get chs(): string { return "被世界意志选中的人，拥有各项均衡的属性和极大的成长空间" }
    public get eng(): string { return "A person chosen by the will of the world, with balanced attributes and great growth potential." }
    public get jpn(): string { return "世界の意志に選ばれた者、各項目が均衡の取れた属性と大きな成長の可能性を持つ。" }
}

@RegisterCharacter("Brave")
export class Brave extends CharacterPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Brave").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("Brave Description").getValue(settingManager.data.language);
    }

    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 1000,
        maxMp: 150,
        physicalAttack: 80,
        magicAttack: 40,
        physicalDefense: 20,
        magicDefense: 20,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 5,
        magicPenetration: 5,
        attackSpeed: 1.0,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 100,
        maxMp: 10,
        physicalAttack: 10,
        magicAttack: 5,
        physicalDefense: 5,
        magicDefense: 5,
        lightResistance: 2,
        darkResistance: 2,
    })

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

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Player/hero0001", sp.SkeletonData, true)).value)
        })
    }

    // 攻击动画Promise会在攻击动作计算完成后resolve
    playAttackAnimation(progress: AttackProgress, animationEndCallback: Function, next: Function) {
        const prefab = getComponentByCharacter(this.instance)
        if (!prefab) return next()
        prefab.playAnimation("Attack01", {
            count: 1,
            speed: this.instance.attackSpeed,
            frameEvent: {
                name: "Attack01",
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
                name: "Attack02",
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


