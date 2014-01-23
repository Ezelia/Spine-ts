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
    export class Bone {
        public static yDown: boolean = false;
        public name: string;

        public x: number = 0;
        public y: number = 0;

        public rotation: number = 0;

        public scaleX: number = 1;
        public scaleY: number = 1;

        public m00: number = 0;
        public m01: number = 0;
        public worldX: number = 0; // a b x

        public m10: number = 0;
        public m11: number = 0;
        public worldY: number = 0; // c d y


        public worldRotation: number = 0;
        public worldScaleX: number = 1;
        public worldScaleY: number = 1;

        constructor(public data, public parent:any) {
            this.setToSetupPose();
        }


        public updateWorldTransform(flipX, flipY) {
            var parent = this.parent;
            if (parent != null) {
                this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
                this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
                if (this.data.inheritScale) {
                    this.worldScaleX = parent.worldScaleX * this.scaleX;
                    this.worldScaleY = parent.worldScaleY * this.scaleY;
                } else {
                    this.worldScaleX = this.scaleX;
                    this.worldScaleY = this.scaleY;
                }
                this.worldRotation = this.data.inheritRotation ? parent.worldRotation + this.rotation : this.rotation;
            } else {
                //this.worldX = this.x;                
                this.worldX = flipX ? -this.x : this.x;
                //this.worldY = this.y;
                this.worldY = (flipY && spine.Bone.yDown != flipY) ? -this.y : this.y;
                //this.worldY = flipY != spine.Bone.yDown ? -this.y : this.y;

                this.worldScaleX = this.scaleX;
                this.worldScaleY = this.scaleY;
                this.worldRotation = this.rotation;
            }
            var radians = this.worldRotation * Math.PI / 180;
            var cos = Math.cos(radians);
            var sin = Math.sin(radians);
            this.m00 = cos * this.worldScaleX;
            this.m10 = sin * this.worldScaleX;
            this.m01 = -sin * this.worldScaleY;
            this.m11 = cos * this.worldScaleY;
            if (flipX) {
                this.m00 = -this.m00;
                this.m01 = -this.m01;
            }
            if (flipY != spine.Bone.yDown) {
                this.m10 = -this.m10;
                this.m11 = -this.m11;
            }
        }
        public setToSetupPose() {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
        }



    }
}