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
    export class SkeletonData {
        public bones: BoneData[];
        public slots: SlotData[];
        public skins: Skin[];
        public events: EventData[];
        public animations: any[];
        public defaultSkin: any = null;
        constructor() {
            this.bones = [];
            this.slots = [];
            this.skins = [];
            this.animations = [];
        }


        /** @return May be null. */
        public findBone(boneName):BoneData {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName) return bones[i];
            return undefined;
        }
        /** @return -1 if the bone was not found. */
        public findBoneIndex(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName) return i;
            return -1;
        }
        /** @return May be null. */
        public findSlot(slotName):SlotData {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                if (slots[i].name == slotName) return slots[i]; //FIXME : need to send PR slot[i]; => slots[i];
            }
            return null;
        }
        /** @return -1 if the bone was not found. */
        public findSlotIndex(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].name == slotName) return i;
            return -1;
        }
        /** @return May be null. */
        public findSkin(skinName) {
            var skins = this.skins;
            for (var i = 0, n = skins.length; i < n; i++)
                if (skins[i].name == skinName) return skins[i];
            return null;
        }


        /** @return May be null. */
        public findEvent(eventName) {
            var events = this.events;
            for (var i = 0, n = events.length; i < n; i++)
                if (events[i].name == eventName) return events[i];
            return null;
        }

        /** @return May be null. */
        public findAnimation(animationName) {
            var animations = this.animations;
            for (var i = 0, n = animations.length; i < n; i++)
                if (animations[i].name == animationName) return animations[i];
            return null;
        }

    }
}