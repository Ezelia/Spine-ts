module spine {
    export class RotateTimeline {
        public boneIndex: number = 0;
        public curves: Curves;
        public frames: any[];
        constructor(frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, angle, ...
            this.frames.length = frameCount * 2;
        }


        public getFrameCount() {
            return this.frames.length / 2;
        }
        public setFrame(frameIndex, time, angle) {
            frameIndex *= 2;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = angle;
        }
        public apply(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return; // Time is before first frame.

            var bone = skeleton.bones[this.boneIndex];

            if (time >= frames[frames.length - 2]) { // Time is after last frame.
                var amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
                while (amount > 180)
                    amount -= 360;
                while (amount < -180)
                    amount += 360;
                bone.rotation += amount * alpha;
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 2);
            var lastFrameValue = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex - 2/*LAST_FRAME_TIME*/] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);

            var amount = frames[frameIndex + 1/*FRAME_VALUE*/] - lastFrameValue;
            while (amount > 180)
                amount -= 360;
            while (amount < -180)
                amount += 360;
            amount = bone.data.rotation + (lastFrameValue + amount * percent) - bone.rotation;
            while (amount > 180)
                amount -= 360;
            while (amount < -180)
                amount += 360;
            bone.rotation += amount * alpha;
        }

    }
}