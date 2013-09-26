module spine {
    export class AttachmentTimeline {
        public slotIndex: number = 0;
        public curves; Curves;
        public frames: any[];
        public attachmentNames: any[];
        constructor(frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.attachmentNames = []; // time, ...
            this.attachmentNames.length = frameCount;
        }


        public getFrameCount() {
            return this.frames.length;
        }
        public setFrame(frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        }
        public apply(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return; // Time is before first frame.

            var frameIndex;
            if (time >= frames[frames.length - 1]) // Time is after last frame.
                frameIndex = frames.length - 1;
            else
                frameIndex = spine.binarySearch(frames, time, 1) - 1;

            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex].setAttachment(!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
        }

    }
}