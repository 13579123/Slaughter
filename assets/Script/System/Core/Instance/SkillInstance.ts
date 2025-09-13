import { Constructor } from "cc"
import { SkillPrototype } from "../Prototype/SkillPrototype"

type SkillInstanceOption = {
    // 额外属性
    Proto: Constructor<SkillPrototype>,
}

export class SkillInstance {

    // 技能等级
    public readonly lv: number = 1

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
        this.proto = new option.Proto(this)
    }

}
