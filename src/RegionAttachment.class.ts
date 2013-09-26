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

    export class RegionAttachment {
        public x: number = 0;
        public y: number = 0;
        public rotation: number = 0;
        public scaleX: number = 1;
        public scaleY: number = 1;
        public width: number = 0;
        public height: number = 0;

        public rendererObject;
        public regionOffsetX: number = 0;
        public regionOffsetY: number = 0;
        public regionWidth: number = 0;
        public regionHeight: number = 0;
        public regionOriginalWidth: number = 0;
        public regionOriginalHeight: number = 0;

        public offset: any[];
        public uvs: any[];
        constructor() { //FIXME : PR : AtlasAttachmentLoader calling it with (name)
            this.offset = [];
            this.offset.length = 8;
            this.uvs = [];
            this.uvs.length = 8;
        }


            public setUVs (u, v, u2, v2, rotate) {
                var uvs = this.uvs;
                if (rotate) {
                    uvs[2/*X2*/] = u;
                    uvs[3/*Y2*/] = v2;
                    uvs[4/*X3*/] = u;
                    uvs[5/*Y3*/] = v;
                    uvs[6/*X4*/] = u2;
                    uvs[7/*Y4*/] = v;
                    uvs[0/*X1*/] = u2;
                    uvs[1/*Y1*/] = v2;
                } else {
                    uvs[0/*X1*/] = u;
                    uvs[1/*Y1*/] = v2;
                    uvs[2/*X2*/] = u;
                    uvs[3/*Y2*/] = v;
                    uvs[4/*X3*/] = u2;
                    uvs[5/*Y3*/] = v;
                    uvs[6/*X4*/] = u2;
                    uvs[7/*Y4*/] = v2;
                }
            }
            public updateOffset () {
                var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
                var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
                var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
                var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
                var localX2 = localX + this.regionWidth * regionScaleX;
                var localY2 = localY + this.regionHeight * regionScaleY;
                var radians = this.rotation * Math.PI / 180;
                var cos = Math.cos(radians);
                var sin = Math.sin(radians);
                var localXCos = localX * cos + this.x;
                var localXSin = localX * sin;
                var localYCos = localY * cos + this.y;
                var localYSin = localY * sin;
                var localX2Cos = localX2 * cos + this.x;
                var localX2Sin = localX2 * sin;
                var localY2Cos = localY2 * cos + this.y;
                var localY2Sin = localY2 * sin;
                var offset = this.offset;
                offset[0/*X1*/] = localXCos - localYSin;
                offset[1/*Y1*/] = localYCos + localXSin;
                offset[2/*X2*/] = localXCos - localY2Sin;
                offset[3/*Y2*/] = localY2Cos + localXSin;
                offset[4/*X3*/] = localX2Cos - localY2Sin;
                offset[5/*Y3*/] = localY2Cos + localX2Sin;
                offset[6/*X4*/] = localX2Cos - localYSin;
                offset[7/*Y4*/] = localYCos + localX2Sin;
            }
            public computeVertices (x, y, bone, vertices) {
                x += bone.worldX;
                y += bone.worldY;
                var m00 = bone.m00;
                var m01 = bone.m01;
                var m10 = bone.m10;
                var m11 = bone.m11;
                var offset = this.offset;
                vertices[0/*X1*/] = offset[0/*X1*/] * m00 + offset[1/*Y1*/] * m01 + x;
                vertices[1/*Y1*/] = offset[0/*X1*/] * m10 + offset[1/*Y1*/] * m11 + y;
                vertices[2/*X2*/] = offset[2/*X2*/] * m00 + offset[3/*Y2*/] * m01 + x;
                vertices[3/*Y2*/] = offset[2/*X2*/] * m10 + offset[3/*Y2*/] * m11 + y;
                vertices[4/*X3*/] = offset[4/*X3*/] * m00 + offset[5/*X3*/] * m01 + x;
                vertices[5/*X3*/] = offset[4/*X3*/] * m10 + offset[5/*X3*/] * m11 + y;
                vertices[6/*X4*/] = offset[6/*X4*/] * m00 + offset[7/*Y4*/] * m01 + x;
                vertices[7/*Y4*/] = offset[6/*X4*/] * m10 + offset[7/*Y4*/] * m11 + y;
            }

    }
}