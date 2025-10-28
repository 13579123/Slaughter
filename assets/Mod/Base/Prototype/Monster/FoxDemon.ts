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

@RegisterLanguageEntry("FoxDemon")
class Entry extends LanguageEntry {
    public get chs(): string { return "狐妖" }
    public get eng(): string { return "Fox Demon" }
    public get jpn(): string { return "狐妖" }
}

@RegisterLanguageEntry("FoxDemon Description")
class Description_Entry extends LanguageEntry {
    public get chs(): string { return "据说狐妖刚诞生的时候只有一条尾巴，但随着年月和法力的增长，那一条尾巴便会慢慢分裂，最终成为拥有着九条尾巴的「九尾狐」" }
    public get eng(): string { return "It is said that when the fox demon was born, it only had one tail. But with the passage of time and the growth of magic, that one tail will gradually split, eventually becoming a " }
    public get jpn(): string { return "狐妖が誕生した時にはまだ一本の尾を持っていたという。しかし年月と魔力の成長によって、その一本の尾は徐々に分裂し、最終的には九本の尾を持つ「九尾狐」になるという" }
}

@RegisterCharacter("FoxDemon")
export class FoxDemon extends CharacterPrototype {

    public get name(): string {
        return LanguageManager.getEntry("FoxDemon").getValue(settingManager.data.language);
    }

    public get description(): string {
        return LanguageManager.getEntry("FoxDemon Description").getValue(settingManager.data.language);
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
            res((await assets.load("Texture/Player/FoxDemon/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 200,
        maxMp: 30,
        physicalAttack: 20,
        magicAttack: 45,
        physicalDefense: 18,
        magicDefense: 18,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 10,
        magicPenetration: 10,
        lightResistance: 5,
        darkResistance: 5,
        attackSpeed: 1.2,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 50,
        maxMp: 10,
        physicalAttack: 4,
        magicAttack: 15,
        physicalDefense: 8,
        magicDefense: 8,
    })

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Monster/FoxDemon/hero00036", sp.SkeletonData, true)).value)
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
