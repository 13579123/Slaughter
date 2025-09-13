
export class Normal {

    public static number(num: number): string {
        if (num < 100000) return num.toFixed(0);
        if (num < 100000000) return (num / 10000).toFixed(1) + "W";
        return (num / 100000000).toFixed(1) + "Y";
    }

}


