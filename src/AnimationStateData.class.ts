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