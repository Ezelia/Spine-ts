module spine {
    export class DrawOrderTimeline {

        public frames: any[];
        public drawOrders: any[];
        constructor(frameCount) {
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.drawOrders = [];
            this.drawOrders.length = frameCount;
        }

        public getFrameCount() {
            return this.frames.length;
        }
        public setFrame(frameIndex, time, drawOrder) {
            this.frames[frameIndex] = time;
            this.drawOrders[frameIndex] = drawOrder;
        }
        public apply(skeleton, lastTime, time, firedEvents, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return; // Time is before first frame.

            var frameIndex;
            if (time >= frames[frames.length - 1]) // Time is after last frame.
                frameIndex = frames.length - 1;
            else
                frameIndex = spine.binarySearch(frames, time, 1) - 1;

            var drawOrder = skeleton.drawOrder;
            var slots = skeleton.slots;
            var drawOrderToSetupIndex = this.drawOrders[frameIndex];
            if (!drawOrderToSetupIndex) {
                for (var i = 0, n = slots.length; i < n; i++)
                    drawOrder[i] = slots[i];
            } else {
                for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = skeleton.slots[drawOrderToSetupIndex[i]];
            }

        }

    }
}