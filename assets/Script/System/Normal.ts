
export class Normal {

    public static number(num: number , fixed = 0 , force = false): string {
        let useFixed = fixed
        if (num === void 0 || num === null) return "0"
        // if (num.toString().indexOf(".") === -1) useFixed = 0
        // if (force) useFixed = fixed
        if (num < 1000) return num.toFixed(useFixed);
        if (num < 100000) return (num / 1000).toFixed(useFixed) + "K";
        if (num < 10000000) return (num / 10000).toFixed(useFixed) + "W";
        return (num / 1000000000).toFixed(useFixed) + "M";
    }

}


