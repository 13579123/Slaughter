import { LanguageEntry } from "db://assets/Module/Language/LanguageEntry";
import { RegisterLanguageEntry } from "db://assets/Module/Language/LanguageManager";

(function() {
    @RegisterLanguageEntry("BeginnerKit")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "新手套装"
        }

        public get eng(): string {
            return "Beginner Kit"
        }

        public get jpn(): string {
            return "初心者セット"
        }

    }
})();

(function() {
    @RegisterLanguageEntry("Sealing")
    class _ extends LanguageEntry {

        public get chs(): string {
            return "封印套装"
        }

        public get eng(): string {
            return "Sealing Set"
        }

        public get jpn(): string {
            return "封印セット"
        }

    }
})();