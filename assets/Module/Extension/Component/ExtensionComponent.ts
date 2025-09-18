import { Component } from "cc";
import { Rx } from "../../Rx";
import { ReactiveEffectOptions, ReactiveEffectRunner } from "../../Rx/reactivity";

export class AutoInterval {
  timer?: number // ms
  count?: number
  complete?: () => void
}

export default class ExtensionComponent extends Component {

  // 已经销毁
  private hasDestroy: boolean = false

  // 所有响应式监听对象
  private effects: ReactiveEffectRunner[] = []
  
  // 所有的定时器
  private autoIntervalSet = new Set<number>()

  // 响应式监听函数
  protected effect(callback: () => void , option?: ReactiveEffectOptions): ReactiveEffectRunner {
    if (this.hasDestroy) return
    // 节流
    let isEffecting = false
    option = {
      scheduler: () => {
        if (isEffecting) return
        isEffecting = true
        this.setAutoInterval(() => {
          runner()
          isEffecting = false
        } , {count: 1})
      } , 
      ...option
    }
    const runner = Rx.effect(callback , option)
    this.effects.push(runner)
    return runner
  }

  // 设置定时器
  protected setAutoInterval(call: Function , option: AutoInterval = {}) {
    if (this.hasDestroy) return
    let count = option.count || -1
    const close = () => {
      clearInterval(inter)
      this.autoIntervalSet?.delete(inter)
    }
    const inter = setInterval(() => {
      if (count === 0) {
        close()
        option.complete && option.complete()
        return
      }
      if (count > -1) count--
      call()
    } , option?.timer)
    this.autoIntervalSet.add(inter)
    return close
  }

  // 当销毁时
  protected onDestroy(): void {
    this.hasDestroy = true
    // 清空所有的定时器
    this.autoIntervalSet.forEach(inter => clearInterval(inter))
    // 清空所有的响应式监听
    this.effects.forEach(effect => {
      if (effect) effect.effect.stop()
    })
    this.effects = []
  }

}