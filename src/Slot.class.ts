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
    export class Slot {
        public r: number = 1;
        public g: number = 1;
        public b: number = 1;
        public a: number = 1;
        private _attachmentTime: number=0;
        public attachment: any = null;


        constructor(public data, public skeleton, public bone:any) {
            this.bone = bone;
            this.setToSetupPose();
        }

        public setAttachment(attachment) {
            this.attachment = attachment;
            this._attachmentTime = this.skeleton.time;
        }
        public setAttachmentTime(time) {
            this._attachmentTime = this.skeleton.time - time;
        }
        public getAttachmentTime() {
            return this.skeleton.time - this._attachmentTime;
        }
        public setToSetupPose() {
            var data = this.data;
            this.r = data.r;
            this.g = data.g;
            this.b = data.b;
            this.a = data.a;

            var slotDatas = this.skeleton.data.slots;
            for (var i = 0, n = slotDatas.length; i < n; i++) {
                if (slotDatas[i] == data) {
                    this.setAttachment(!data.attachmentName ? null : this.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));
                    break;
                }
            }
        }
    }
}