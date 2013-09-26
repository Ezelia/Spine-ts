module spine {
    export class AnimationState {
        public queue: any[];

        public current;
        public previous;
        public currentTime: number = 0;
        public previousTime: number = 0;
        public currentLoop: boolean = false;
        public previousLoop: boolean = false;
        public mixTime: number = 0;
        public mixDuration: number = 0;

        constructor(public data: AnimationStateData) {

            this.queue = [];
        }

        public update(delta) {
            this.currentTime += delta;
            this.previousTime += delta;
            this.mixTime += delta;

            if (this.queue.length > 0) {
                var entry = this.queue[0];
                if (this.currentTime >= entry.delay) {
                    this._setAnimation(entry.animation, entry.loop);
                    this.queue.shift();
                }
            }
        }
        public apply(skeleton: Skeleton) {
            if (!this.current) return;
            if (this.previous) {
                this.previous.apply(skeleton, this.previousTime, this.previousLoop);
                var alpha = this.mixTime / this.mixDuration;
                if (alpha >= 1) {
                    alpha = 1;
                    this.previous = null;
                }
                this.current.mix(skeleton, this.currentTime, this.currentLoop, alpha);
            } else
                this.current.apply(skeleton, this.currentTime, this.currentLoop);
        }
        public clearAnimation() {
            this.previous = null;
            this.current = null;
            this.queue.length = 0;
        }
        private _setAnimation(animation, loop) {
            this.previous = null;
            if (animation && this.current) {
                this.mixDuration = this.data.getMix(this.current, animation);
                if (this.mixDuration > 0) {
                    this.mixTime = 0;
                    this.previous = this.current;
                    this.previousTime = this.currentTime;
                    this.previousLoop = this.currentLoop;
                }
            }
            this.current = animation;
            this.currentLoop = loop;
            this.currentTime = 0;
        }
        /** @see #setAnimation(Animation, Boolean) */
        public setAnimationByName(animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation) throw "Animation not found: " + animationName;
            this.setAnimation(animation, loop);
        }
        /** Set the current animation. Any queued animations are cleared and the current animation time is set to 0.
        * @param animation May be null. */
        public setAnimation(animation, loop) {
            this.queue.length = 0;
            this._setAnimation(animation, loop);
        }
        /** @see #addAnimation(Animation, Boolean, Number) */
        public addAnimationByName(animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation) throw "Animation not found: " + animationName;
            this.addAnimation(animation, loop, delay);
        }
        /** Adds an animation to be played delay seconds after the current or last queued animation.
        * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
        public addAnimation(animation, loop, delay) {
            var entry: any = {};
            entry.animation = animation;
            entry.loop = loop;

            if (!delay || delay <= 0) {
                var previousAnimation = this.queue.length == 0 ? this.current : this.queue[this.queue.length - 1].animation;
                if (previousAnimation != null)
                    delay = previousAnimation.duration - this.data.getMix(previousAnimation, animation) + (delay || 0);
                else
                    delay = 0;
            }
            entry.delay = delay;

            this.queue.push(entry);
        }
        /** Returns true if no animation is set or if the current time is greater than the animation duration, regardless of looping. */
        public isComplete() {
            return !this.current || this.currentTime >= this.current.duration;
        }

    }
}