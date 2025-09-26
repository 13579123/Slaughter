import { LanguageType, AllLanguageType } from "db://assets/Module/Language/LangaugeType";
import { Manager } from "../../System/Manager";
import { Config } from "../Config";

class SettingDTO {

    // 背景音乐
    public backVolume: number = 0

    // 音效音乐
    public effectVolume: number = 0

    // 语言
    public language: LanguageType = AllLanguageType.chs as LanguageType

    constructor(data?: SettingData) {
        if (data) {
            this.backVolume = data.backVolume || 0
            this.effectVolume = data.effectVolume || 0
            this.language = data.language || AllLanguageType.chs as LanguageType
        }
    }
}

export class SettingData {

    // 背景音乐
    public backVolume: number = 0.5

    // 音效音乐
    public effectVolume: number = 0.5

    // 语言
    public language: LanguageType = AllLanguageType.chs as LanguageType

    constructor(data?: SettingDTO) {
        if (data) {
            this.backVolume = data.backVolume || 0
            this.effectVolume = data.effectVolume || 0
            this.language = data.language || AllLanguageType.chs as LanguageType
        }
    }
}

export const settingManager = new Manager({
    storageKey: "slaughter:game:setting",
    descrypt: Config.descrypt,
    Constructor: SettingData,
    DtoCostructor: SettingDTO,
})


try {
    // @ts-ignore
    window.settingManager = settingManager
} catch(e) {
}