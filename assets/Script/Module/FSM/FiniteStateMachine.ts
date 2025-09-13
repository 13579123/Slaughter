import { warn } from "cc"

type StateOption = {
    inital: string,
    states: {
        [key: string]: StateOption | string,
    },
    on: {
        [key: string]: {
            from: string , 
            to: string
        }[],
    },
    id?: string,
    current?: string,
    lock?: {
        [key: string]: {
            lockIds?: string[],
        }
    },
}

function copyObject(obj: any) {
    if (typeof obj !== "object") return obj
    if (Array.isArray(obj)) {
        const r = []
        for (let i = 0; i < obj.length; i++) r.push(copyObject(obj[i]))
        return r
    }
    const result = {}
    Object.keys(obj).forEach(k => {
        result[k] = copyObject(obj[k])
    })
    return result
}

export class FiniteStateMachine {

    protected readonly option: StateOption

    constructor(option: StateOption) {
        this.option = copyObject(option)
        this.initState(this.option)
    }

    public get state(): string {
        let state = this.option.states[this.option.current]
        while (typeof state !== "string") {
            state = state.states[state.current]
        }
        return state
    }

    public get statePath(): string[] {
        let state = this.option.states[this.option.current]
        const arr = [this.option.current]
        while (typeof state !== "string") {
            const c = state.current
            state = state.states[c]
            arr.push(c)
        }
        return arr
    }

    public send(event: string) {
        let op = this.option
        // 找到对应的option
        while(!op.on[event]) {
            const nop = op.states[op.current]
            // 没有找到对应的事件
            if (typeof nop === "string") {
                return warn(`event ${event} not find in this state`)
            } else op = nop
        }
        // from to
        let ft = null
        const relations = op.on[event]
        relations.forEach(v => { if (v.from === op.current || v.from === op.inital) ft = v })
        // 是否可以转换
        if (!this.pass(event , ft , op)) return false
        // 上一个状态
        const last = op.current
        // 新状态
        op.current = ft.to
        // 初始化之前的状态
        if (typeof op.states[last] !== "string") this.initState(op.states[last])
        return true
    }

    protected pass(event: string , ft: {from: string , to: string} , op: StateOption): boolean {
        // 没有找到对应的关系
        if (ft === null) {
            warn(`event ${event} not find in this state`)
            return false
        }
        // 对应关系所指向的状态未被定义
        if (!op.states[ft.to]) {
            warn(`target state ${ft.to} not find in this state option`)
            return false
        }
        // 检查下层状态上锁情况，以及是否允许转换
        let childOp = op.states[op.current]
        while(typeof childOp !== "string") {
            const lockData = childOp.lock[childOp.current]
            if (lockData && lockData.lockIds && lockData.lockIds.length > 0) {
                for (let i = 0; i < lockData.lockIds.length; i++) {
                    if (lockData.lockIds[i] === op.id || lockData.lockIds[i] === "*") {
                        warn(`event ${event} emit fail : ${childOp.current} is locked`)
                        return false
                    }
                }
            }
            childOp = childOp.states[childOp.current]
        }
        return true
    }

    protected initState(option: StateOption) {
        let op = option
        op.current = op.inital
        op.id = op.id || ""
        Object.keys(op.states).forEach(k => {
            const s = op.states[k]
            if (typeof s !== "string") this.initState(s)
        })
    }

}

// // @ts-ignore
// window.fsm = new FiniteStateMachine({
//     inital: "right",
//     id: "direct",
//     states: {
//         right: {
//             inital: "idle",
//             states: {
//                 idle: "idle",
//                 atk: "atk",
//                 run: "run"
//             },
//             on: {
//                 attack: [
//                     {from: "idle" , to: "atk"},
//                     {from: "run" , to: "atk"},
//                 ],
//                 move: [
//                     {from: "idle" , to: "run"},
//                 ],
//                 attackEnd: [
//                     {from: "atk" , to: "idle"},
//                 ],
//                 stop: [
//                     {from: "run" , to: "idle"}
//                 ]
//             },
//             lock: {
//                 atk: {
//                     lockIds: ["direct"],
//                 },
//             }
//         },
//         left: {
//             inital: "idle",
//             states: {
//                 idle: "idle",
//                 atk: "atk",
//                 run: "run"
//             },
//             on: {
//                 attack: [
//                     {from: "idle" , to: "atk"},
//                     {from: "run" , to: "atk"},
//                 ],
//                 move: [
//                     {from: "idle" , to: "run"},
//                 ],
//                 attackEnd: [
//                     {from: "atk" , to: "idle"},
//                 ],
//                 stop: [
//                     {from: "run" , to: "idle"}
//                 ]
//             },
//             lock: {
//                 atk: {
//                     lockIds: ["direct"],
//                 },
//             }
//         },
//     },
//     on: {
//         turn: [
//             {from: "right" , to: "left"},
//             {from: "left" , to: "right"},
//         ]
//     }
// })