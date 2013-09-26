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