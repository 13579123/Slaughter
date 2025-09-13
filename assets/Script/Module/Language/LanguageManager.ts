import { error } from "cc"
import { LanguageEntry } from "./LanguageEntry"
import { LanguageType } from "./LangaugeType"

export class LanguageManager {

    // 所有语言数据
    public static languageData = new Map<string , Map<string , LanguageEntry>>()

    // 获取翻译对象
    public static getEntry(key: string , group: string = "default"): LanguageEntry {
        let g = LanguageManager.languageData.get(group)
        if (!g) {
            error("Can not found Entry by key: " + key)
            return new LanguageEntry(key)
        }
        const enrty = g.get(key)
        if (!enrty) {
            error("Can not found Entry by key: " + key)
            return new LanguageEntry(key)
        }
        return enrty
    }

    // 获取翻译结果
    public static getTranslation(key: string , language: LanguageType , group: string = "default"): string {
        const entry = this.getEntry(key , group)
        return entry.getValue(language)
    }

}

// 注册语言翻译实例
export const RegisterLanguageEntry: (key: string , group?: string) => ClassDecorator = (
    key: string , 
    group: string = "default"
) => {
    return (TF: any) => {
        let g = LanguageManager.languageData.get(group)
        if (!g) LanguageManager.languageData.set(group , g = new Map)
        g.set(key , new TF(key))
    }
}
