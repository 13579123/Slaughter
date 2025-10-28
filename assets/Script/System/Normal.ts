
export class Normal {

    public static number(num: number , fixed: number = 0): string {
        if (num < 10000) return num.toFixed(fixed);
        if (num < 1000000) return (num / 1000).toFixed(fixed || 2) + "K";
        if (num < 100000000) return (num / 10000).toFixed(fixed || 2) + "W";
        return (num / 1000000).toFixed(fixed || 2) + "M";
    }

}


