import { LanguageEntry } from "db://assets/Module/Language/LanguageEntry";
import { RegisterLanguageEntry } from "db://assets/Module/Language/LanguageManager";

(function() {
    @RegisterLanguageEntry("maxHp")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "生命值"
        }

        public get eng(): string {
            return "MaxHP"
        }

        public get jpn(): string {
            return "最大HP"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("maxMp")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "魔法值"
        }

        public get eng(): string {
            return "MaxMP"
        }

        public get jpn(): string {
            return "最大MP"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("physicalAttack")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "攻击力"
        }

        public get eng(): string {
            return "Attack"
        }

        public get jpn(): string {
            return "攻撃力"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("magicAttack")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "魔力值"
        }

        public get eng(): string {
            return "Magic"
        }

        public get jpn(): string {
            return "魔力值"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("physicalDefense")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "防御"
        }

        public get eng(): string {
            return "Defense"
        }

        public get jpn(): string {
            return "防御"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("magicDefense")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "魔抗"
        }

        public get eng(): string {
            return "MagicDefense"
        }

        public get jpn(): string {
            return "魔抗"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("lightAttack")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "光攻击"
        }

        public get eng(): string {
            return "LightAttack"
        }

        public get jpn(): string {
            return "光攻"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("darkAttack")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "暗攻击"
        }

        public get eng(): string {
            return "DarkAttack"
        }

        public get jpn(): string {
            return "暗攻"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("lightResistance")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "光抗"
        }

        public get eng(): string {
            return "LightResistance"
        }

        public get jpn(): string {
            return "光抗"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("darkResistance")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "暗抗"
        }

        public get eng(): string {
            return "DarkResistance"
        }

        public get jpn(): string {
            return "暗抗"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("physicalPenetration")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "物理穿透"
        }

        public get eng(): string {
            return "PhysicalPenetration"
        }

        public get jpn(): string {
            return "物理貫通"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("magicPenetration")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "魔法穿透"
        }

        public get eng(): string {
            return "MagicPenetration"
        }

        public get jpn(): string {
            return "魔法貫通"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("criticalRate")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "暴击率"
        }

        public get eng(): string {
            return "CriticalRate"
        }

        public get jpn(): string {
            return "暴擊率"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("criticalDamage")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "暴击伤害"
        }

        public get eng(): string {
            return "CriticalDamage"
        }

        public get jpn(): string {
            return "暴擊ダメージ"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("attackSpeed")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "攻击速度"
        }

        public get eng(): string {
            return "AttackSpeed"
        }

        public get jpn(): string {
            return "攻撃速度"
        }
    }
})();
(function() {
    @RegisterLanguageEntry("coolDown")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "冷却缩减"
        }

        public get eng(): string {
            return "CoolDown"
        }

        public get jpn(): string {
            return "クールダウン短縮"
        }
    }
})();