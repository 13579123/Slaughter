
export class Normal {

    public static number(num: number , fixed = 1 , force = false): string {
        let useFixed = fixed
        if (num.toString().indexOf(".") === -1) useFixed = 0
        if (force) useFixed = fixed
        if (num < 10000) return num.toFixed(useFixed);
        if (num < 100000) return (num / 1000).toFixed(useFixed) + "K";
        if (num < 1000000) return (num / 10000).toFixed(useFixed) + "W";
        return (num / 10000000).toFixed(useFixed) + "M";
    }

}


