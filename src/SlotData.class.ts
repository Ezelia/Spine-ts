module spine {
    export class SlotData {
        public r: number = 1;
        public g: number = 1;
        public b: number = 1;
        public a: number = 1;
        public attachmentName: string;
        public additiveBlending: boolean = false;

        constructor(public name, public boneData) {
        }
    }
}