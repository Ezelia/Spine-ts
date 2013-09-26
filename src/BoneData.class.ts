module spine {
    export class BoneData {

        public length: number = 0;
        public x: number = 0;
        public y: number = 0;
        public rotation: number = 0;
        public inheritScale: boolean = true;
        public inheritRotation: boolean = true;

        public scaleX: number = 1;
        public scaleY: number = 1;
        constructor(public name, public parent) {
        }
    }
}