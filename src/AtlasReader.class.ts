module spine {
    export class AtlasReader {
        private lines: string;
        private index: number = 0;
        constructor(text) {
            this.lines = text.split(/\r\n|\r|\n/);
        }
        public trim(value) {
            return value.replace(/^\s+|\s+$/g, "");
        }
        public readLine() {
            if (this.index >= this.lines.length) return null;
            return this.lines[this.index++];
        }
        public readValue() {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1) throw "Invalid line: " + line;
            return this.trim(line.substring(colon + 1));
        }
        /** Returns the number of tuple values read (2 or 4). */
        public readTuple(tuple) {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1) throw "Invalid line: " + line;
            var i = 0, lastMatch = colon + 1;
            for (; i < 3; i++) {
                var comma = line.indexOf(",", lastMatch);
                if (comma == -1) {
                    if (i == 0) throw "Invalid line: " + line;
                    break;
                }
                tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
                lastMatch = comma + 1;
            }
            tuple[i] = this.trim(line.substring(lastMatch));
            return i + 1;
        }
    }
}