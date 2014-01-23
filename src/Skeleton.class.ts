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
    export class Skeleton {
        public bones: Bone[];
        public slots: Slot[];
        public drawOrder: any[];
        public data: SkeletonData;


        public x: number = 0;
        public y: number = 0;
        public skin: Skin;
        public r: number = 1;
        public g: number = 1;
        public b: number = 1;
        public a: number = 1;
        public time: number = 0;
        public flipX: boolean = false;
        public flipY: boolean = false;

        constructor(skeletonData: SkeletonData) {
            this.data = skeletonData;

            this.bones = [];
            for (var i = 0, n = skeletonData.bones.length; i < n; i++) {
                var boneData = skeletonData.bones[i];
                var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];
                this.bones.push(new spine.Bone(boneData, parent));
            }

            this.slots = [];
            this.drawOrder = [];
            for (var i = 0, n = skeletonData.slots.length; i < n; i++) {
                var slotData = skeletonData.slots[i];
                var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
                var slot = new spine.Slot(slotData, this, bone);
                this.slots.push(slot);
                this.drawOrder.push(slot);
            }
        }


        /** Updates the world transform for each bone. */
        public updateWorldTransform() {
            var flipX = this.flipX;
            var flipY = this.flipY;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].updateWorldTransform(flipX, flipY);
        }
        /** Sets the bones and slots to their setup pose values. */
        public setToSetupPose() {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        }
        public setBonesToSetupPose() {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].setToSetupPose();
        }
        public setSlotsToSetupPose() {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                slots[i].setToSetupPose();  //FIXME : no i parameter ?? setToSetupPose(i) => setToSetupPose()
        }
        /** @return May return null. */
        public getRootBone() {
            return this.bones.length == 0 ? null : this.bones[0];
        }
        /** @return May be null. */
        public findBone(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName) return bones[i];
            return null;
        }
        /** @return -1 if the bone was not found. */
        public findBoneIndex(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName) return i;
            return -1;
        }
        /** @return May be null. */
        public findSlot(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName) return slots[i];
            return null;
        }
        /** @return -1 if the bone was not found. */
        public findSlotIndex(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName) return i;
            return -1;
        }
        public setSkinByName(skinName) {
            var skin = this.data.findSkin(skinName);
            if (!skin) throw "Skin not found: " + skinName;
            this.setSkin(skin);
        }
        /** Sets the skin used to look up attachments not found in the {@link SkeletonData#getDefaultSkin() default skin}. Attachments
        * from the new skin are attached if the corresponding attachment from the old skin was attached.
        * @param newSkin May be null. */
        public setSkin(newSkin) {
            if (this.skin && newSkin) newSkin._attachAll(this, this.skin);
            this.skin = newSkin;
        }
        /** @return May be null. */
        public getAttachmentBySlotName(slotName, attachmentName) {
            return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
        }
        /** @return May be null. */
        public getAttachmentBySlotIndex(slotIndex, attachmentName) {
            if (this.skin) {
                var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment) return attachment;
            }
            if (this.data.defaultSkin) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        }
        /** @param attachmentName May be null. */
        public setAttachment(slotName, attachmentName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {  //FIXME  : PR slots.size => slots.length
                var slot = slots[i];
                if (slot.data.name == slotName) {
                    var attachment = null;
                    if (attachmentName) {
                        attachment = this.getAttachmentBySlotIndex(i, attachmentName); //FIXME : PR  getAttachment => getAttachmentBySlotIndex                        
                        if (!attachment) throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw "Slot not found: " + slotName;
        }
        public update(delta: number) {
            this.time += delta; //FIXME : PR time => this.time
        }

    }
}