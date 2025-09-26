import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { LanguageEntry } from 'db://assets/Module/Language/LanguageEntry';
import { LanguageManager, RegisterLanguageEntry } from 'db://assets/Module/Language/LanguageManager';
import { achivementManager } from 'db://assets/Script/Game/Manager/AchivementManager';
import { settingManager } from 'db://assets/Script/Game/Manager/SettingManager';
import { RegisterAchivement } from 'db://assets/Script/Game/System/Manager/AchivementManager';
import { AchivementPrototype } from 'db://assets/Script/Game/System/Prototype/AchivementPrototype';
const { ccclass, property } = _decorator;

const level = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ"]

@RegisterLanguageEntry("Killer")
export class KillerLanguageEntry extends LanguageEntry {

    public get chs(): string {
        return "杀手" + level[this.data.level - 1]
    }

    public get eng(): string {
        return "Killer" + level[this.data.level - 1]
    }

    public get jpn(): string {
        return "Killer" + level[this.data.level - 1]
    }

}

@RegisterLanguageEntry("Killer Description")
export class KillerDescriptionLanguageEntry extends LanguageEntry {

    public get chs(): string {
        return `击杀 ${this.data.killCount} 个敌人`
    }

    public get eng(): string {
        return `Kill ${this.data.killCount} enemies`
    }

    public get jpn(): string {
        return `Kill ${this.data.killCount} enemies`
    }

}

@RegisterAchivement("Killer1", true)
export class Killer1 extends AchivementPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Killer").getValue(
            settingManager.data.language, { level: 1 }
        )
    }

    public get description(): string {
        return LanguageManager.getEntry("Killer Description").getValue(
            settingManager.data.language, { level: 1 , killCount: 10 }
        )
    }

    // 图标
    public async icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Achivement/Killer/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get open(): boolean {
        return true
    }

    public get progress(): { progress: number; maxProgress: number; } {
        let killCount = 0
        Object.values(achivementManager.data.dayTaskData.kill).forEach(v => killCount += (v || 0))
        return {
            progress: killCount,
            maxProgress: 10
        };
    }

}

@RegisterAchivement("Killer2", true)
export class Killer2 extends AchivementPrototype {

    public get name(): string {
        return LanguageManager.getEntry("Killer").getValue(
            settingManager.data.language, { level: 2 }
        )
    }

    public get description(): string {
        return LanguageManager.getEntry("Killer Description").getValue(
            settingManager.data.language, { level: 2 , killCount: 30 }
        )
    }

    // 图标
    public async icon(): Promise<SpriteFrame> {
        return new Promise(async res => {
            const assets = new CcNative.Asset.AssetManager("ModBaseResource")
            res((await assets.load("Texture/Achivement/Killer/spriteFrame", SpriteFrame, true)).value)
        })
    }

    public get open(): boolean {
        return achivementManager.data.hasGetReward("Killer1")
    }

    public get progress(): { progress: number; maxProgress: number; } {
        let killCount = 0
        Object.values(achivementManager.data.dayTaskData.kill).forEach(v => killCount += v)
        return {
            progress: killCount,
            maxProgress: 30
        };
    }

}