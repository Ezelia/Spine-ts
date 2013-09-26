module spine {
    export class AtlasRegion {
        public page;
        public name;
        public x: number = 0;
        public y: number = 0;
        public width: number = 0;
        public height: number = 0;
        public u: number = 0;
        public v: number = 0;
        public u2: number = 0;
        public v2: number = 0;
        public offsetX: number = 0;
        public offsetY: number = 0;
        public originalWidth: number = 0;
        public originalHeight: number = 0;
        public index: number = 0;
        public rotate: boolean = false;
        public splits;
        public pads;
    }
}