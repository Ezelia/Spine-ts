module spine {
    export class BoundingBoxAttachment {
        public type = spine.AttachmentType.boundingBox;

        public vertices: any[];

        constructor(public name) {

            this.vertices = [];
        }


        public computeWorldVertices(x, y, bone, worldVertices) {
            x += bone.worldX;
            y += bone.worldY;
            var m00 = bone.m00;
            var m01 = bone.m01;
            var m10 = bone.m10;
            var m11 = bone.m11;
            var vertices = this.vertices;
            for (var i = 0, n = vertices.length; i < n; i = 2) {
                var px = vertices[i];
                var py = vertices[i + 1];
                worldVertices[i] = px * m00 + py * m01 + x;
                worldVertices[i + 1] = px * m10 + py * m11 + y;
            }
        }

    }
}