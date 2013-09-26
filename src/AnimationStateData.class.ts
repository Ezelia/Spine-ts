module spine {
    export class AnimationStateData {
        public animationToMixTime: any;

        public defaultMix: number = 0;
        constructor(public skeletonData: SkeletonData) {
            this.skeletonData = skeletonData;
            this.animationToMixTime = {};
        }


        public setMixByName(fromName, toName, duration) {
            var from = this.skeletonData.findAnimation(fromName);
            if (!from) throw "Animation not found: " + fromName;
            var to = this.skeletonData.findAnimation(toName);
            if (!to) throw "Animation not found: " + toName;
            this.setMix(from, to, duration);
        }
        public setMix(from, to, duration) {
            this.animationToMixTime[from.name + ":" + to.name] = duration;
        }
        public getMix(from, to) {
            var time = this.animationToMixTime[from.name + ":" + to.name];
            return time ? time : this.defaultMix;
        }

    }
}