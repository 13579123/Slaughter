
export class Normal {

    public static number(num: number): string {
        if (num < 10000) return num.toFixed(0);
        if (num < 1000000) return (num / 1000).toFixed(2) + "K";
        if (num < 100000000) return (num / 10000).toFixed(2) + "W";
        return (num / 1000000).toFixed(2) + "M";
    }

}


