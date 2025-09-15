import { Constructor } from "cc"
import { SkillPrototype } from "../Prototype/SkillPrototype"
import { CharacterInstance } from "./CharacterInstance"

type SkillInstanceOption = {
    // 技能等级
    lv: number,
    // 对应的角色
    characterInstance?: CharacterInstance,
    // 额外属性
    Proto: Constructor<SkillPrototype>,
}

export class SkillInstance {

    // 技能等级
    public readonly lv: number = 1

    // 携带技能的角色
    public readonly characterInstance: CharacterInstance = null

    // 对应的原型
    public readonly proto: SkillPrototype = null

    // 冷却时间
    protected _coolTime: number = 0
    protected _interval: number = 0
    public get coolTime(): number {
        return this._coolTime
    }
    public set coolTime(value: number) {
        this._coolTime = value * 1000
        clearInterval(this._interval)
        let lastTime = Date.now()
        this._interval = setInterval(() => {
            const now = Date.now()
            this._coolTime = Math.max(0, this._coolTime - (now - lastTime))
            lastTime = now
            if (this._coolTime <= 0) {
                this._coolTime = 0
                clearInterval(this._interval)
            }
        } , 100)
    }

    // 构造器
    public constructor(option: SkillInstanceOption) {
        this.characterInstance = option.characterInstance
        this.proto = new option.Proto(this)
        this.lv = option.lv
    }

}
