import { error } from "cc";
import { LanguageType } from "./LangaugeType";

export class LanguageEntry<T = {[key: string]: any}> {

    protected data: T = {} as any

    public get chs(): string { return this.key }
    public get cht(): string { return this.key }
    public get jpn(): string { return this.key }
    public get kor(): string { return this.key }
    public get dan(): string { return this.key }
    public get deu(): string { return this.key }
    public get eng(): string { return this.key }
    public get enu(): string { return this.key }
    public get fin(): string { return this.key }
    public get fra(): string { return this.key }
    public get frc(): string { return this.key }
    public get esp(): string { return this.key }
    public get ita(): string { return this.key }
    public get nld(): string { return this.key }
    public get plk(): string { return this.key }
    public get ptb(): string { return this.key }
    public get rus(): string { return this.key }
    public get sve(): string { return this.key }
    public get tha(): string { return this.key }


    public getValue(lan: LanguageType = "chs" , data?: T) {
        this.data = data
        let result = this[lan]
        if (!this[lan] && this[lan] !== "") {
            error("This language is not supported or there is no corresponding translation for this language : " + lan)
            return this.key
        }
        return result
    }

    constructor(protected readonly key: string = "") {
    }

}