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