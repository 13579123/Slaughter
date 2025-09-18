import { _decorator, Button, Component, find, Node, Prefab, Sprite } from 'cc';
import { CcNative } from 'db://assets/Module/CcNative';
import { BuffInstance } from 'db://assets/Script/System/Core/Instance/BuffInstance';
import { DetailInfoPrefab } from '../DetailInfoPrefab';
const { ccclass, property } = _decorator;

@ccclass('FightBuffItemPrefab')
export class FightBuffItemPrefab extends Component {

    @property(Prefab)
    protected DetailPrefab: Prefab = null;

    public setBuffData(buff: BuffInstance) {
        const iconSprite = this.node.getChildByName('Icon').getComponent(Sprite);
        buff.proto.icon().then(icon => iconSprite.spriteFrame = icon)
        this.node.on(Button.EventType.CLICK, async () => {
            const detailNode = CcNative.instantiate(this.DetailPrefab)
            detailNode.getComponent(DetailInfoPrefab).setDetail({
                content: [
                    {
                        title: buff.proto.name,
                        rightMessage: buff.proto.description,
                        icon: await buff.proto.icon(),
                        buttons: [],
                    }
                ],
                closeCallback: () => find("Canvas").removeChild(detailNode)
            })
            find("Canvas").addChild(detailNode)
        })
        return
    }

}


