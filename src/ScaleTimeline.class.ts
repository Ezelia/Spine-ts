module spine {
    export class ScaleTimeline {
        public boneIndex: number = 0;
        public curves: Curves;
        public frames: any[];
        constructor(frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, x, y, ...
            this.frames.length = frameCount * 3;
        }


        public getFrameCount() {
            return this.frames.length / 3;
        }
        public setFrame(frameIndex, time, x, y) {
            frameIndex *= 3;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = x;
            this.frames[frameIndex + 2] = y;
        }
        public apply(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return; // Time is before first frame.

            var bone = skeleton.bones[this.boneIndex];

            if (time >= frames[frames.length - 3]) { // Time is after last frame.
                bone.scaleX += (bone.data.scaleX - 1 + frames[frames.length - 2] - bone.scaleX) * alpha;
                bone.scaleY += (bone.data.scaleY - 1 + frames[frames.length - 1] - bone.scaleY) * alpha;
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 3);
            var lastFrameX = frames[frameIndex - 2];
            var lastFrameY = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*LAST_FRAME_TIME*/] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);

            bone.scaleX += (bone.data.scaleX - 1 + lastFrameX + (frames[frameIndex + 1/*FRAME_X*/] - lastFrameX) * percent - bone.scaleX) * alpha;
            bone.scaleY += (bone.data.scaleY - 1 + lastFrameY + (frames[frameIndex + 2/*FRAME_Y*/] - lastFrameY) * percent - bone.scaleY) * alpha;
        }

    }
}