import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { BuffPrototype } from 'db://assets/Script/System/Core/Prototype/BuffPrototype';
import { RegisterBuff } from 'db://assets/Script/System/Manager/BuffManager';
import { Normal } from 'db://assets/Script/System/Normal';
const { ccclass, property } = _decorator;

@RegisterLanguageEntry("ExtraProperty")
class ExtraProperty_Entry extends LanguageEntry {
    public get chs(): string { return "属性提升" }
    public get eng(): string { return "ExtraProperty" }
    public get jpn(): string { return "属性強化" }
}

@RegisterLanguageEntry("ExtraProperty Description")
class ExtraProperty_Description_Entry extends LanguageEntry {
    public get chs(): string {
        let result = ''
        if (this.data.physicalAttack) result += `物理攻击 +${this.data.physicalAttack.toFixed(0)}\n`
        if (this.data.magicAttack) result += `魔法攻击 +${this.data.magicAttack.toFixed(0)}\n`
        if (this.data.physicalDefense) result += `防御 +${this.data.physicalDefense.toFixed(0)}\n`
        if (this.data.magicDefense) result += `魔法防御 +${this.data.magicDefense.toFixed(0)}\n`
        if (this.data.physicalPenetration) result += `物理穿透 +${this.data.magicDefense.toFixed(0)}\n`
        if (this.data.magicPenetration) result += `魔法穿透 +${this.data.magicDefense.toFixed(0)}\n`
        if (this.data.criticalRate) result += `暴击率 +${(this.data.criticalRate * 100).toFixed(2)}%\n`
        if (this.data.criticalDamage) result += `暴击伤害 +${(this.data.criticalDamage * 100).toFixed(2)}%\n`
        if (this.data.attackSpeed) result += `攻击速度 +${(this.data.attackSpeed).toFixed(2)}\n`
        return result
    }
    public get eng(): string {
        let result = ''
        if (this.data.physicalAttack) result += `Physical Attack +${this.data.physicalAttack.toFixed(0)}\n`
        if (this.data.magicAttack) result += `Magic Attack +${this.data.magicAttack.toFixed(0)}\n`
        if (this.data.physicalDefense) result += `Defense +${this.data.physicalDefense.toFixed(0)}\n`
        if (this.data.magicDefense) result += `Magic Defense +${this.data.magicDefense.toFixed(0)}\n`
        if (this.data.physicalPenetration) result += `Physical Penetration +${this.data.physicalPenetration.toFixed(0)}\n`
        if (this.data.magicPenetration) result += `Magic Penetration +${this.data.magicPenetration.toFixed(0)}\n`
        if (this.data.criticalRate) result += `Critical Rate +${(this.data.criticalRate * 100).toFixed(2)}%\n`
        if (this.data.criticalDamage) result += `Critical Damage +${(this.data.criticalDamage * 100).toFixed(2)}%\n`
        if (this.data.attackSpeed) result += `Attack Speed +${(this.data.attackSpeed).toFixed(2)}\n`
        return result
    }
    public get jpn(): string {
        let result = ''
        if (this.data.physicalAttack) result += `物理攻撃力 +${this.data.physicalAttack.toFixed(0)}\n`
        if (this.data.magicAttack) result += `魔法攻撃力 +${this.data.magicAttack.toFixed(0)}\n`
        if (this.data.physicalDefense) result += `防御力 +${this.data.physicalDefense.toFixed(0)}\n`
        if (this.data.magicDefense) result += `魔法防御力 +${this.data.magicDefense.toFixed(0)}\n`
        if (this.data.physicalPenetration) result += `物理貫通 +${this.data.physicalPenetration.toFixed(0)}\n`
        if (this.data.magicPenetration) result += `魔法貫通 +${this.data.magicPenetration.toFixed(0)}\n`
        if (this.data.criticalRate) result += `会心率 +${(this.data.criticalRate * 100).toFixed(2)}%\n`
        if (this.data.criticalDamage) result += `会心ダメージ +${(this.data.criticalDamage * 100).toFixed(2)}%\n`
        if (this.data.attackSpeed) result += `攻撃速度 +${(this.data.attackSpeed).toFixed(2)}\n`
        return result
    }
}

@RegisterBuff("ExtraProperty")
export class ExtraProperty extends BuffPrototype {

    public get name(): string {
        return LanguageManager.getEntry("ExtraProperty").getValue(settingManager.data.language)
    }

    public get description(): string {
        return LanguageManager.getEntry("ExtraProperty Description").getValue(
            settingManager.data.language , this.instance.extraProperty
        )
    }

    public icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Buff/extraProperty/spriteFrame", SpriteFrame, true)).value)
        })
    }

}


