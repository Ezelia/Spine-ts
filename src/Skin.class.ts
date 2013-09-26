module spine {
    export class Skin {
        public attachments: any;
        constructor(public name) {
            this.attachments = {};
        }
        public addAttachment(slotIndex, name, attachment) {
            this.attachments[slotIndex + ":" + name] = attachment;
        }
        public getAttachment(slotIndex, name) {
            return this.attachments[slotIndex + ":" + name];
        }
        private _attachAll(skeleton, oldSkin) {
            for (var key in oldSkin.attachments) {
                var colon = key.indexOf(":");
                var slotIndex = parseInt(key.substring(0, colon));
                var name = key.substring(colon + 1);
                var slot = skeleton.slots[slotIndex];
                if (slot.attachment && slot.attachment.name == name) {
                    var attachment = this.getAttachment(slotIndex, name);
                    if (attachment) slot.setAttachment(attachment);
                }
            }
        }
    }
}