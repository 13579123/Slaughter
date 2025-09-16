import { log } from "cc";

class Message {

    // 弹框消息
    public toast(msg: string) {
        log(msg)
    }

}

export const message = new Message();