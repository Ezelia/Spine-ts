module spine {
    export class AtlasAttachmentLoader {
        constructor(public atlas) { }
        public newAttachment (skin, type, name) {
            switch (type) {
                case spine.AttachmentType.region:
                    var region = this.atlas.findRegion(name);
                    if (!region) throw "Region not found in atlas: " + name + " (" + type + ")";
                    var attachment = new spine.RegionAttachment();
                    attachment.rendererObject = region;
                    attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
                    attachment.regionOffsetX = region.offsetX;
                    attachment.regionOffsetY = region.offsetY;
                    attachment.regionWidth = region.width;
                    attachment.regionHeight = region.height;
                    attachment.regionOriginalWidth = region.originalWidth;
                    attachment.regionOriginalHeight = region.originalHeight;
                    return attachment;
            }
            throw "Unknown attachment type: " + type;
        }
    }

}