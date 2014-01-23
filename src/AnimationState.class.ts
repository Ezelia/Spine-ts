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
    export class AnimationState {
        public tracks: any[];
        public events: Event[];


        public onStart: any;
        public onEnd: any;
        public onComplete: any;
        public onEvent: any;
        public timeScale = 1;

        constructor(public data: AnimationStateData) {

            this.tracks = [];
            this.events = [];
        }

        public update(delta) {

            delta *= this.timeScale;
            for (var i = 0; i < this.tracks.length; i++) {
                var current = this.tracks[i];
                if (!current) continue;

                var trackDelta = delta * current.timeScale;

                current.time += trackDelta;

                if (current.previous) {
                    current.previous.time += trackDelta;
                    current.mixTime += trackDelta;
                }



                var next = current.next;
                if (next) {
                    if (current.lastTime >= next.delay) this.setCurrent(i, next);
                } else {
                    // End non-looping animation when it reaches its end time and there is no next entry.
                    if (!current.loop && current.lastTime >= current.endTime) this.clearTrack(i);
                }
            }
        }
        public apply(skeleton: Skeleton) {

            for (var i = 0; i < this.tracks.length; i++) {
                var current = this.tracks[i];
                if (!current) continue;

                this.events.length = 0;

                var time = current.time;

                var lastTime = current.lastTime;
                var endTime = current.endTime;
                var loop = current.loop;
                if (!loop && time > endTime) time = endTime;

                var previous = current.previous;
                if (!previous)
                    current.animation.apply(skeleton, current.lastTime, time, loop, this.events);
                else {
                    var previousTime = previous.time;
                    if (!previous.loop && previousTime > previous.endTime) previousTime = previous.endTime;
                    previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);

                    var alpha = current.mixTime / current.mixDuration;
                    if (alpha >= 1) {
                        alpha = 1;
                        current.previous = null;
                    }
                    current.animation.mix(skeleton, current.lastTime, time, loop, this.events, alpha);
                }


                for (var ii = 0, nn = this.events.length; ii < nn; ii++) {
                    var event = this.events[ii];
                    if (current.onEvent != null) current.onEvent(i, event);
                    if (this.onEvent != null) this.onEvent(i, event);
                }


                // Check if completed the animation or a loop iteration.
                if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {
                    var count = Math.floor(time / endTime);
                    if (current.onComplete) current.onComplete(i, count);
                    if (this.onComplete) this.onComplete(i, count);
                }

                current.lastTime = current.time;
            }
        }
        public clearTracks() {
            for (var i = 0, n = this.tracks.length; i < n; i++)
                this.clearTrack(i);
            this.tracks.length = 0;
        }
        public clearTrack(trackIndex) {
            if (trackIndex >= this.tracks.length) return;
            var current = this.tracks[trackIndex];
            if (!current) return;

            if (current.onEnd != null) current.onEnd(trackIndex);
            if (this.onEnd != null) this.onEnd(trackIndex);

            this.tracks[trackIndex] = null;
        }
        private _expandToIndex(index) {
            if (index < this.tracks.length) return this.tracks[index];
            while (index >= this.tracks.length)
                this.tracks.push(null);
            return null;
        }
        public setCurrent(index, entry) {
            var current = this._expandToIndex(index);
            if (current) {
                var previous = current.previous;
                current.previous = null;

                if (current.onEnd != null) current.onEnd(index);
                if (this.onEnd != null) this.onEnd(index);

                entry.mixDuration = this.data.getMix(current.animation, entry.animation);
                if (entry.mixDuration > 0) {
                    entry.mixTime = 0;
                    // If a mix is in progress, mix from the closest animation.
                    if (previous && current.mixTime / current.mixDuration < 0.5)
                        entry.previous = previous;
                    else
                        entry.previous = current;


                }
            }

            this.tracks[index] = entry;

            if (entry.onStart != null) entry.onStart(index);
            if (this.onStart != null) this.onStart(index);
        }
        
        public setAnimationByName(trackIndex, animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation) throw "Animation not found: " + animationName;
            this.setAnimation(trackIndex, animation, loop);
        }

        /** Set the current animation. Any queued animations are cleared. */
        public setAnimation(trackIndex, animation, loop) {
            var entry = new spine.TrackEntry();
            entry.animation = animation;
            entry.loop = loop;
            entry.endTime = animation.duration;
            this.setCurrent(trackIndex, entry);
            return entry;
        }

        
        public addAnimationByName(trackIndex, animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation) throw "Animation not found: " + animationName;
            this.addAnimation(trackIndex, animation, loop, delay);
        }
        /** Adds an animation to be played delay seconds after the current or last queued animation.
        * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */

        public addAnimation(trackIndex, animation, loop, delay) {
            var entry = new spine.TrackEntry();
            entry.animation = animation;
            entry.loop = loop;

            entry.endTime = animation.duration;

            var last = this._expandToIndex(trackIndex);
            if (last) {
                while (last.next)
                    last = last.next;
                last.next = entry;
            } else
                this.tracks[trackIndex] = entry;

            if (delay <= 0) {
                if (last)
                    delay += last.endTime - this.data.getMix(last.animation, animation);
                else
                    delay = 0;
            }
            entry.delay = delay;

            return entry;
        }

        /** May be null. */
        public getCurrent(trackIndex) {
            if (trackIndex >= this.tracks.length) return null;
            return this.tracks[trackIndex];
        }

    }
}