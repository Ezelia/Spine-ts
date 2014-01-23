/*******************************************************************************
* Helper class to render Spine animation on a canvas 2d context without external
* dependencies
*
* Author : Alaa-eddine KADDOURI
* http://ezelia.com/en/
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
/*
TODO : 
 - handle texture scaling
 - benchmark setTransform() vs canvas scale + rotate and use setTransform if better


*/


function textureMap(ctx, texture, pts) {
    //borrowed from : http://stackoverflow.com/questions/4774172/image-manipulation-and-texture-mapping-using-html5-canvas/4774298#4774298

    var tris = [[0, 1, 2], [2, 3, 0]]; // Split in two triangles
    for (var t = 0; t < 2; t++) {
        var pp = tris[t];
        var x0 = pts[pp[0]].x, x1 = pts[pp[1]].x, x2 = pts[pp[2]].x;
        var y0 = pts[pp[0]].y, y1 = pts[pp[1]].y, y2 = pts[pp[2]].y;
        var u0 = pts[pp[0]].u, u1 = pts[pp[1]].u, u2 = pts[pp[2]].u;
        var v0 = pts[pp[0]].v, v1 = pts[pp[1]].v, v2 = pts[pp[2]].v;

        // Set clipping area so that only pixels inside the triangle will
        // be affected by the image drawing operation
        ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip();

        // Compute matrix transform
        var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
        var delta_a = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
        var delta_b = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
        var delta_c = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2
                      - v0 * u1 * x2 - u0 * x1 * v2;
        var delta_d = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
        var delta_e = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
        var delta_f = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2
                      - v0 * u1 * y2 - u0 * y1 * v2;

        // Draw the transformed image
        ctx.transform(delta_a / delta, delta_d / delta,
                      delta_b / delta, delta_e / delta,
                      delta_c / delta, delta_f / delta);
        ctx.drawImage(texture, 0, 0);
        ctx.restore();
    }
}
var Canvas2DSpine = function(basePath, x, y)
{
    this.basePath = basePath;
	this.skeletonData = undefined;
	this.lastTime = Date.now();
	this.state = undefined;
	this.skeleton = undefined;
	this.vertices = [];
	this.ready = false;
	
	this.x = x;
	this.y = y;
}

Canvas2DSpine.prototype.load = function (skeletonName, animation, skin, mix) {
	var _this = this;	
	this.ready = false;
	var loadAtlas = function(atlasText) {
		var textureCount = 0;
		atlas = new spine.Atlas(atlasText, {
			load: function (page, path) {
				textureCount++;
				
				page.img = new Image();
				page.img.onload = function() {
					page.width = page.img.width;
					page.height = page.img.height;
					atlas.updateUVs(page);
					textureCount--;			
				}
				page.img.src = _this.basePath + path;
			},
			unload: function (texture) {
				texture.destroy();
			}
		});
		function waitForTextures() {
			if (!textureCount)
			    Ajax.get(_this.basePath + skeletonName + ".json", function (skeletonText) {
					var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
					_this.skeletonData = json.readSkeletonData(JSON.parse(skeletonText));
					
					spine.Bone.yDown = true;

					_this.skeleton = new spine.Skeleton(_this.skeletonData);
					_this.skeleton.getRootBone().x = _this.x;
					_this.skeleton.getRootBone().y = _this.y;
					_this.skeleton.updateWorldTransform();

					var stateData = new spine.AnimationStateData(_this.skeletonData);	
					_this.state = new spine.AnimationState(stateData);
					if (mix)
					{
						for (var i = 0; i<mix.length; i++) 
							stateData.setMixByName.apply(stateData, mix[i]);
						
						
					}
					
					if (skin)
					{
						_this.skeleton.setSkinByName(skin);
						_this.skeleton.setSlotsToSetupPose();					
					}
					_this.state.setAnimationByName(0, animation, true);
					
					_this.ready = true;
					
				});
			else
				setTimeout(waitForTextures, 100);
		}
		waitForTextures();
	}
	
	
	Ajax.get(this.basePath + skeletonName + ".atlas", loadAtlas);
}

Canvas2DSpine.prototype.update = function () {
	if (!this.ready) return;
	var dt = (Date.now() - this.lastTime)/1000;
	this.lastTime = Date.now();
	
	
	this.state.update(dt);
	this.state.apply(this.skeleton);
	this.skeleton.updateWorldTransform();
	
	
}
Canvas2DSpine.prototype.setAnimation = function (animation, repeat) {
	this.state.setAnimationByName(0, animation, repeat);
	
}



Canvas2DSpine.prototype.draw = function (context) {
       var skeleton = this.skeleton;
        var drawOrder = skeleton.drawOrder;
        for (var i = 0, n = drawOrder.length; i < n; i++) {
            var slot = drawOrder[i];
            var attachment = slot.attachment;
            if (!(attachment instanceof spine.RegionAttachment))
                continue;
            attachment.computeVertices(skeleton.x, skeleton.y, slot.bone, this.vertices);

            var x0 = this.vertices[0];
            var y0 = this.vertices[1];
            var x1 = this.vertices[2];
            var y1 = this.vertices[3];
            var x2 = this.vertices[4];
            var y2 = this.vertices[5];
            var x3 = this.vertices[6];
            var y3 = this.vertices[7];

            var dw = Math.abs(Math.round(100 * Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))) / 100);
            var dh = Math.abs(Math.round(100 * Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2))) / 100);

            var w = attachment.rendererObject.width;
            var h = attachment.rendererObject.height;
            var px = attachment.rendererObject.x;
            var py = attachment.rendererObject.y;

            //var w1 = attachment.rendererObject.page.img.width * (attachment.uvs[4] - attachment.uvs[0]);
            //var h1 = attachment.rendererObject.page.img.width * (attachment.uvs[7] - attachment.uvs[3]);
            //var px1 = attachment.rendererObject.page.img.width * attachment.uvs[0];
            //var py1 = attachment.rendererObject.page.img.height * attachment.uvs[3];
            //slot.bone.scaleX = 0.5;
            //slot.bone.scaleY = 0.5;
            //attachment.scaleX = 0.5;
            //attachment.scaleY = 0.5;
            var scaleX = 1;
            var scaleY = 1;
            var angle = -(slot.bone.worldRotation + attachment.rotation) * Math.PI / 180;

            //angle *= 0.5;
            if (skeleton.flipX) {
                scaleX *= -1;
                angle *= -1;
            }

            if (skeleton.flipY) {
                scaleY *= -1;
                angle *= -1;
            }

            /// Slow implementation
			
            textureMap(context, attachment.rendererObject.page.img, [
                { x: this.vertices[2], y: this.vertices[3], u: px, v: py },
                { x: this.vertices[4], y: this.vertices[5], u: px + w, v: py },
                { x: this.vertices[6], y: this.vertices[7], u: px + w, v: py + h },
                { x: this.vertices[0], y: this.vertices[1], u: px, v: py + h }
            ]);
			
			/*
            context.save();
            context.translate(x1, y1);
            context.rotate(angle);
            context.scale(scaleX, scaleY);
            context.drawImage(attachment.rendererObject.page.img, px, py, w, h, 0, 0, dw, dh);
            context.restore();
			*/

	}
	
	
}