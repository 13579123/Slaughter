import { sp, SpriteFrame } from "cc";
import { CcNative } from "db://assets/Script/Module/CcNative";
import { LanguageEntry } from "db://assets/Script/Module/Language/LanguageEntry";
import { LanguageManager, RegisterLanguageEntry } from "db://assets/Script/Module/Language/LanguageManager";
import { BasePrototypeProperty } from "db://assets/Script/System/Core/Property/BasePrototypeProperty";
import { CharacterPrototype } from "db://assets/Script/System/Core/Prototype/CharacterPrototype";
import { RegisterCharacter } from "db://assets/Script/System/Manager/CharacterManager";

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
        return LanguageManager.getEntry("Brave").getValue();
    }

    public get description(): string {
        return LanguageManager.getEntry("Brave Description").getValue();
    }

    public baseProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 150,
        maxMp: 70,
        physicalAttack: 30,
        magicAttack: 40,
        physicalDefense: 20,
        magicDefense: 20,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        physicalPenetration: 5,
        magicPenetration: 5,
    })

    public growProperty: BasePrototypeProperty = new BasePrototypeProperty({
        maxHp: 30,
        maxMp: 10,
        physicalAttack: 10,
        magicAttack: 15,
        physicalDefense: 7,
        magicDefense: 7,
    })

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/avatar/spriteFrame" , SpriteFrame)).value)
        })
    }

    public skeletonData(): Promise<sp.SkeletonData> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Spine/Player/hero0001" , sp.SkeletonData)).value)
        })
    }

}


