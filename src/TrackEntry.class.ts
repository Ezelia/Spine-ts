module spine {
    export class TrackEntry {
        public next = null;
        public previous = null;
        public animation = null;
        public loop = false;
        public delay = 0;
        public time = 0;
        public lastTime = -1;
        public endTime = 0;
        public timeScale = 1;
        public mixTime = 0;
        public mixDuration = 0;

        public onStart: any;
        public onEnd: any;
        public onComplete: any;
        public onEvent: any;
    }
}