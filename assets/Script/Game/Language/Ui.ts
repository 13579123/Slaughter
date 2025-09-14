import { LanguageEntry } from "../../Module/Language/LanguageEntry";
import { RegisterLanguageEntry } from "../../Module/Language/LanguageManager";

(function() {
    @RegisterLanguageEntry("Loading...")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "加载中..."
        }

        public get eng(): string {
            return "Loading..."
        }

        public get jpn(): string {
            return "読み込み中..."
        }

    }
})();
(function() {
    @RegisterLanguageEntry("Close")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "关闭"
        }

        public get eng(): string {
            return "Close"
        }

        public get jpn(): string {
            return "閉じる"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("Language")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "语言"
        }

        public get eng(): string {
            return "Language"
        }

        public get jpn(): string {
            return "言語"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("Setting")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "设置"
        }

        public get eng(): string {
            return "Settings"
        }

        public get jpn(): string {
            return "設定"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("BackVolume")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "背景音量"
        }

        public get eng(): string {
            return "Back Volume"
        }

        public get jpn(): string {
            return "背景の音量"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("EffectVolume")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "特效音量"
        }

        public get eng(): string {
            return "Effect Volume"
        }

        public get jpn(): string {
            return "効果の音量"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("LevelSelect")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "关卡选择"
        }

        public get eng(): string {
            return "Level Select"
        }

        public get jpn(): string {
            return "レベル選択"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("Backpack")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "背包"
        }

        public get eng(): string {
            return "Backpack"
        }

        public get jpn(): string {
            return "バックパック"
        }

    }
})();
(function() {
    @RegisterLanguageEntry("Skill")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "技能"
        }

        public get eng(): string {
            return "Skill"
        }

        public get jpn(): string {
            return "スキル"     
        }
        
    }
})();
(function() {
    @RegisterLanguageEntry("Unload")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "卸下"
        }

        public get eng(): string {
            return "Unload"
        }

        public get jpn(): string {
            return "アンロード"
        }

    }
})();