/*******************************************************************************
* Spine TypeScript runtimes : https://github.com/Ezelia/Spine-ts
*
* Author  : Alaa-eddine KADDOURI
* Website : http://ezelia.com/en/
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
* list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
* this list of conditions and the following disclaimer in the documentation
* and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
******************************************************************************/


module spine {
    export class ColorTimeline {
        public slotIndex: number = 0;
        public curves; Curves;
        public frames: any[];
        constructor(frameCount) {
            this.curves = new spine.Curves(frameCount);
            this.frames = []; // time, r, g, b, a, ...
            this.frames.length = frameCount * 5;
        }


        public getFrameCount() {
            return this.frames.length / 5;
        }
        public setFrame(frameIndex, time, r, g, b, a) {
            frameIndex *= 5;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = r;
            this.frames[frameIndex + 2] = g;
            this.frames[frameIndex + 3] = b;
            this.frames[frameIndex + 4] = a;
        }
        public apply(skeleton, lastTime, time, firedEvents, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return; // Time is before first frame.

            var slot = skeleton.slots[this.slotIndex];

            if (time >= frames[frames.length - 5]) { // Time is after last frame.
                var i = frames.length - 1;
                slot.r = frames[i - 3];
                slot.g = frames[i - 2];
                slot.b = frames[i - 1];
                slot.a = frames[i];
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 5);
            var lastFrameR = frames[frameIndex - 4];
            var lastFrameG = frames[frameIndex - 3];
            var lastFrameB = frames[frameIndex - 2];
            var lastFrameA = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex - 5/*LAST_FRAME_TIME*/] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);

            var r = lastFrameR + (frames[frameIndex + 1/*FRAME_R*/] - lastFrameR) * percent;
            var g = lastFrameG + (frames[frameIndex + 2/*FRAME_G*/] - lastFrameG) * percent;
            var b = lastFrameB + (frames[frameIndex + 3/*FRAME_B*/] - lastFrameB) * percent;
            var a = lastFrameA + (frames[frameIndex + 4/*FRAME_A*/] - lastFrameA) * percent;
            if (alpha < 1) {
                slot.r += (r - slot.r) * alpha;
                slot.g += (g - slot.g) * alpha;
                slot.b += (b - slot.b) * alpha;
                slot.a += (a - slot.a) * alpha;
            } else {
                slot.r = r;
                slot.g = g;
                slot.b = b;
                slot.a = a;
            }
        }

    }
}