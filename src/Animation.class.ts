module spine {
    export class Animation {
        constructor(public name, public timelines, public duration) {
        }
        public apply(skeleton, time, loop) {
            if (loop && this.duration != 0) time %= this.duration;
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, time, 1);
        }
        public mix(skeleton, time, loop, alpha) {
            if (loop && this.duration != 0) time %= this.duration;
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, time, alpha);
        }
    }
}