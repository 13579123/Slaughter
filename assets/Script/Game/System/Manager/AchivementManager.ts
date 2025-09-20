import { AchivementPrototype } from "../Prototype/AchivementPrototype";

// 所有成就
const AllAchivements = new Map<string , AchivementPrototype>();
const AllDayTaskAchivements = new Map<string , AchivementPrototype>();

// 注册成就
export const  RegisterAchivement = (key: string , dayTask: boolean = false) => {
    return (T : any) => {
        const t = new T()
        AllAchivements.set(key, t);
        if (dayTask) {
            AllDayTaskAchivements.set(key, t);
        }
    }
}

// 获取所有成就
export const getAllAchivements = () => {
    return AllAchivements.values()
}

// 获取成就
export const getAchivement = (key: string) => {
    return AllAchivements.get(key);
}

// 获取成就key
export const getAchivementKey = (achivement: AchivementPrototype) => {
    for (let [key, value] of AllAchivements) {
        if (value === achivement) {
            return key;
        }
    }
}

// 获取所有每日任务
export const getAllDayTaskAchivements = () => {
    return AllDayTaskAchivements.values();
}

// 判断是否是每日任务
export const isDayTask = (key: string|AchivementPrototype) => {
    if (typeof key === 'string') {
        return AllDayTaskAchivements.has(key);
    }
    let r = false
    AllDayTaskAchivements.forEach((v  , k) => {
        if (AllDayTaskAchivements.has(k)) {
            r = true
        }
    })
    return r
}