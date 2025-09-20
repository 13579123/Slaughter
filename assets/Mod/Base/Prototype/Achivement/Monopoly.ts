import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { achivementManager } from 'db://assets/Script/Game/Manager/AchivementManager';
import { RegisterAchivement } from 'db://assets/Script/Game/System/Manager/AchivementManager';
import { AchivementPrototype } from 'db://assets/Script/Game/System/Prototype/AchivementPrototype';
const { ccclass, property } = _decorator;

@RegisterAchivement("Monopoly")
export class Monopoly extends AchivementPrototype {

    public get name(): string {
        return "大富翁"
    }

    public get description(): string {
        return "获取1000000金币"
    }

    // 图标
    public async icon(): Promise<SpriteFrame> {
        return null
    }

    public get progress(): { progress: number; maxProgress: number; } {
        return {
            progress: achivementManager.data.achivementData.resource.addGold,
            maxProgress: 1000000
        };
    }

}


