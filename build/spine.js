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
var spine;
(function (spine) {
    var Animation = (function () {
        function Animation(name, timelines, duration) {
            this.name = name;
            this.timelines = timelines;
            this.duration = duration;
        }
        Animation.prototype.apply = function (skeleton, time, loop) {
            if (loop && this.duration != 0)
                time %= this.duration;
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, time, 1);
        };
        Animation.prototype.mix = function (skeleton, time, loop, alpha) {
            if (loop && this.duration != 0)
                time %= this.duration;
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, time, alpha);
        };
        return Animation;
    })();
    spine.Animation = Animation;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AnimationStateData = (function () {
        function AnimationStateData(skeletonData) {
            this.skeletonData = skeletonData;
            this.defaultMix = 0;
            this.skeletonData = skeletonData;
            this.animationToMixTime = {};
        }
        AnimationStateData.prototype.setMixByName = function (fromName, toName, duration) {
            var from = this.skeletonData.findAnimation(fromName);
            if (!from)
                throw "Animation not found: " + fromName;
            var to = this.skeletonData.findAnimation(toName);
            if (!to)
                throw "Animation not found: " + toName;
            this.setMix(from, to, duration);
        };
        AnimationStateData.prototype.setMix = function (from, to, duration) {
            this.animationToMixTime[from.name + ":" + to.name] = duration;
        };
        AnimationStateData.prototype.getMix = function (from, to) {
            var time = this.animationToMixTime[from.name + ":" + to.name];
            return time ? time : this.defaultMix;
        };
        return AnimationStateData;
    })();
    spine.AnimationStateData = AnimationStateData;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AnimationState = (function () {
        function AnimationState(data) {
            this.data = data;
            this.currentTime = 0;
            this.previousTime = 0;
            this.currentLoop = false;
            this.previousLoop = false;
            this.mixTime = 0;
            this.mixDuration = 0;
            this.queue = [];
        }
        AnimationState.prototype.update = function (delta) {
            this.currentTime += delta;
            this.previousTime += delta;
            this.mixTime += delta;

            if (this.queue.length > 0) {
                var entry = this.queue[0];
                if (this.currentTime >= entry.delay) {
                    this._setAnimation(entry.animation, entry.loop);
                    this.queue.shift();
                }
            }
        };
        AnimationState.prototype.apply = function (skeleton) {
            if (!this.current)
                return;
            if (this.previous) {
                this.previous.apply(skeleton, this.previousTime, this.previousLoop);
                var alpha = this.mixTime / this.mixDuration;
                if (alpha >= 1) {
                    alpha = 1;
                    this.previous = null;
                }
                this.current.mix(skeleton, this.currentTime, this.currentLoop, alpha);
            } else
                this.current.apply(skeleton, this.currentTime, this.currentLoop);
        };
        AnimationState.prototype.clearAnimation = function () {
            this.previous = null;
            this.current = null;
            this.queue.length = 0;
        };
        AnimationState.prototype._setAnimation = function (animation, loop) {
            this.previous = null;
            if (animation && this.current) {
                this.mixDuration = this.data.getMix(this.current, animation);
                if (this.mixDuration > 0) {
                    this.mixTime = 0;
                    this.previous = this.current;
                    this.previousTime = this.currentTime;
                    this.previousLoop = this.currentLoop;
                }
            }
            this.current = animation;
            this.currentLoop = loop;
            this.currentTime = 0;
        };

        /** @see #setAnimation(Animation, Boolean) */
        AnimationState.prototype.setAnimationByName = function (animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation)
                throw "Animation not found: " + animationName;
            this.setAnimation(animation, loop);
        };

        /** Set the current animation. Any queued animations are cleared and the current animation time is set to 0.
        * @param animation May be null. */
        AnimationState.prototype.setAnimation = function (animation, loop) {
            this.queue.length = 0;
            this._setAnimation(animation, loop);
        };

        /** @see #addAnimation(Animation, Boolean, Number) */
        AnimationState.prototype.addAnimationByName = function (animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation)
                throw "Animation not found: " + animationName;
            this.addAnimation(animation, loop, delay);
        };

        /** Adds an animation to be played delay seconds after the current or last queued animation.
        * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
        AnimationState.prototype.addAnimation = function (animation, loop, delay) {
            var entry = {};
            entry.animation = animation;
            entry.loop = loop;

            if (!delay || delay <= 0) {
                var previousAnimation = this.queue.length == 0 ? this.current : this.queue[this.queue.length - 1].animation;
                if (previousAnimation != null)
                    delay = previousAnimation.duration - this.data.getMix(previousAnimation, animation) + (delay || 0);
else
                    delay = 0;
            }
            entry.delay = delay;

            this.queue.push(entry);
        };

        /** Returns true if no animation is set or if the current time is greater than the animation duration, regardless of looping. */
        AnimationState.prototype.isComplete = function () {
            return !this.current || this.currentTime >= this.current.duration;
        };
        return AnimationState;
    })();
    spine.AnimationState = AnimationState;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var BoneData = (function () {
        function BoneData(name, parent) {
            this.name = name;
            this.parent = parent;
            this.length = 0;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.inheritScale = true;
            this.inheritRotation = true;
            this.scaleX = 1;
            this.scaleY = 1;
        }
        return BoneData;
    })();
    spine.BoneData = BoneData;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var Bone = (function () {
        function Bone(data, parent) {
            this.data = data;
            this.parent = parent;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.m00 = 0;
            this.m01 = 0;
            this.worldX = 0;
            this.m10 = 0;
            this.m11 = 0;
            this.worldY = 0;
            this.worldRotation = 0;
            this.worldScaleX = 1;
            this.worldScaleY = 1;
            this.setToSetupPose();
        }
        Bone.prototype.updateWorldTransform = function (flipX, flipY) {
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
                this.worldX = this.x;
                this.worldY = this.y;
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
        };
        Bone.prototype.setToSetupPose = function () {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
        };
        Bone.yDown = false;
        return Bone;
    })();
    spine.Bone = Bone;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AttachmentTimeline = (function () {
        function AttachmentTimeline(frameCount) {
            this.slotIndex = 0;
            this.curves = new spine.Curves(frameCount);
            this.frames = [];
            this.frames.length = frameCount;
            this.attachmentNames = [];
            this.attachmentNames.length = frameCount;
        }
        AttachmentTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        AttachmentTimeline.prototype.setFrame = function (frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        };
        AttachmentTimeline.prototype.apply = function (skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0])
                return;

            var frameIndex;
            if (time >= frames[frames.length - 1])
                frameIndex = frames.length - 1;
else
                frameIndex = spine.binarySearch(frames, time, 1) - 1;

            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex].setAttachment(!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
        };
        return AttachmentTimeline;
    })();
    spine.AttachmentTimeline = AttachmentTimeline;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var Atlas = (function () {
        function Atlas(atlasText, textureLoader) {
            this.atlasText = atlasText;
            this.textureLoader = textureLoader;
            this.pages = [];
            this.regions = [];

            var reader = new spine.AtlasReader(atlasText);
            var tuple = [];
            tuple.length = 4;
            var page = null;
            while (true) {
                var line = reader.readLine();
                if (line == null)
                    break;
                line = reader.trim(line);
                if (line.length == 0)
                    page = null;
else if (!page) {
                    page = new spine.AtlasPage();
                    page.name = line;

                    page.format = spine.Atlas.Format[reader.readValue()];

                    reader.readTuple(tuple);
                    page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
                    page.magFilter = spine.Atlas.TextureFilter[tuple[1]];

                    var direction = reader.readValue();
                    page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
                    page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
                    if (direction == "x")
                        page.uWrap = spine.Atlas.TextureWrap.repeat;
else if (direction == "y")
                        page.vWrap = spine.Atlas.TextureWrap.repeat;
else if (direction == "xy")
                        page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;

                    textureLoader.load(page, line);

                    this.pages.push(page);
                } else {
                    var region = new spine.AtlasRegion();
                    region.name = line;
                    region.page = page;

                    region.rotate = reader.readValue() == "true";

                    reader.readTuple(tuple);
                    var x = parseInt(tuple[0]);
                    var y = parseInt(tuple[1]);

                    reader.readTuple(tuple);
                    var width = parseInt(tuple[0]);
                    var height = parseInt(tuple[1]);

                    region.u = x / page.width;
                    region.v = y / page.height;
                    if (region.rotate) {
                        region.u2 = (x + height) / page.width;
                        region.v2 = (y + width) / page.height;
                    } else {
                        region.u2 = (x + width) / page.width;
                        region.v2 = (y + height) / page.height;
                    }
                    region.x = x;
                    region.y = y;
                    region.width = Math.abs(width);
                    region.height = Math.abs(height);

                    if (reader.readTuple(tuple) == 4) {
                        region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

                        if (reader.readTuple(tuple) == 4) {
                            region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

                            reader.readTuple(tuple);
                        }
                    }

                    region.originalWidth = parseInt(tuple[0]);
                    region.originalHeight = parseInt(tuple[1]);

                    reader.readTuple(tuple);
                    region.offsetX = parseInt(tuple[0]);
                    region.offsetY = parseInt(tuple[1]);

                    region.index = parseInt(reader.readValue());

                    this.regions.push(region);
                }
            }
        }
        Atlas.prototype.findRegion = function (name) {
            var regions = this.regions;
            for (var i = 0, n = regions.length; i < n; i++)
                if (regions[i].name == name)
                    return regions[i];
            return null;
        };
        Atlas.prototype.dispose = function () {
            var pages = this.pages;
            for (var i = 0, n = pages.length; i < n; i++)
                this.textureLoader.unload(pages[i].rendererObject);
        };
        Atlas.prototype.updateUVs = function (page) {
            var regions = this.regions;
            for (var i = 0, n = regions.length; i < n; i++) {
                var region = regions[i];
                if (region.page != page)
                    continue;
                region.u = region.x / page.width;
                region.v = region.y / page.height;
                if (region.rotate) {
                    region.u2 = (region.x + region.height) / page.width;
                    region.v2 = (region.y + region.width) / page.height;
                } else {
                    region.u2 = (region.x + region.width) / page.width;
                    region.v2 = (region.y + region.height) / page.height;
                }
            }
        };
        Atlas.Format = {
            alpha: 0,
            intensity: 1,
            luminanceAlpha: 2,
            rgb565: 3,
            rgba4444: 4,
            rgb888: 5,
            rgba8888: 6
        };

        Atlas.TextureFilter = {
            nearest: 0,
            linear: 1,
            mipMap: 2,
            mipMapNearestNearest: 3,
            mipMapLinearNearest: 4,
            mipMapNearestLinear: 5,
            mipMapLinearLinear: 6
        };

        Atlas.TextureWrap = {
            mirroredRepeat: 0,
            clampToEdge: 1,
            repeat: 2
        };
        return Atlas;
    })();
    spine.Atlas = Atlas;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AtlasPage = (function () {
        function AtlasPage() {
        }
        return AtlasPage;
    })();
    spine.AtlasPage = AtlasPage;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AtlasAttachmentLoader = (function () {
        function AtlasAttachmentLoader(atlas) {
            this.atlas = atlas;
        }
        AtlasAttachmentLoader.prototype.newAttachment = function (skin, type, name) {
            switch (type) {
                case spine.AttachmentType.region:
                    var region = this.atlas.findRegion(name);
                    if (!region)
                        throw "Region not found in atlas: " + name + " (" + type + ")";
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
        };
        return AtlasAttachmentLoader;
    })();
    spine.AtlasAttachmentLoader = AtlasAttachmentLoader;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AtlasRegion = (function () {
        function AtlasRegion() {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.u = 0;
            this.v = 0;
            this.u2 = 0;
            this.v2 = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
            this.index = 0;
            this.rotate = false;
        }
        return AtlasRegion;
    })();
    spine.AtlasRegion = AtlasRegion;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AtlasReader = (function () {
        function AtlasReader(text) {
            this.index = 0;
            this.lines = text.split(/\r\n|\r|\n/);
        }
        AtlasReader.prototype.trim = function (value) {
            return value.replace(/^\s+|\s+$/g, "");
        };
        AtlasReader.prototype.readLine = function () {
            if (this.index >= this.lines.length)
                return null;
            return this.lines[this.index++];
        };
        AtlasReader.prototype.readValue = function () {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1)
                throw "Invalid line: " + line;
            return this.trim(line.substring(colon + 1));
        };

        /** Returns the number of tuple values read (2 or 4). */
        AtlasReader.prototype.readTuple = function (tuple) {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1)
                throw "Invalid line: " + line;
            var i = 0, lastMatch = colon + 1;
            for (; i < 3; i++) {
                var comma = line.indexOf(",", lastMatch);
                if (comma == -1) {
                    if (i == 0)
                        throw "Invalid line: " + line;
                    break;
                }
                tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
                lastMatch = comma + 1;
            }
            tuple[i] = this.trim(line.substring(lastMatch));
            return i + 1;
        };
        return AtlasReader;
    })();
    spine.AtlasReader = AtlasReader;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var AttachmentType = (function () {
        function AttachmentType() {
        }
        AttachmentType.region = 0;
        return AttachmentType;
    })();
    spine.AttachmentType = AttachmentType;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var Curves = (function () {
        function Curves(frameCount) {
            this.curves = [];
            this.curves.length = (frameCount - 1) * 6;
        }
        Curves.prototype.setLinear = function (frameIndex) {
            this.curves[frameIndex * 6] = 0;
        };
        Curves.prototype.setStepped = function (frameIndex) {
            this.curves[frameIndex * 6] = -1;
        };

        /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
        * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
        * the difference between the keyframe's values. */
        Curves.prototype.setCurve = function (frameIndex, cx1, cy1, cx2, cy2) {
            var subdiv_step = 1 / 10/*BEZIER_SEGMENTS*/ ;
            var subdiv_step2 = subdiv_step * subdiv_step;
            var subdiv_step3 = subdiv_step2 * subdiv_step;
            var pre1 = 3 * subdiv_step;
            var pre2 = 3 * subdiv_step2;
            var pre4 = 6 * subdiv_step2;
            var pre5 = 6 * subdiv_step3;
            var tmp1x = -cx1 * 2 + cx2;
            var tmp1y = -cy1 * 2 + cy2;
            var tmp2x = (cx1 - cx2) * 3 + 1;
            var tmp2y = (cy1 - cy2) * 3 + 1;
            var i = frameIndex * 6;
            var curves = this.curves;
            curves[i] = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3;
            curves[i + 1] = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3;
            curves[i + 2] = tmp1x * pre4 + tmp2x * pre5;
            curves[i + 3] = tmp1y * pre4 + tmp2y * pre5;
            curves[i + 4] = tmp2x * pre5;
            curves[i + 5] = tmp2y * pre5;
        };
        Curves.prototype.getCurvePercent = function (frameIndex, percent) {
            percent = percent < 0 ? 0 : (percent > 1 ? 1 : percent);
            var curveIndex = frameIndex * 6;
            var curves = this.curves;
            var dfx = curves[curveIndex];
            if (!dfx)
                return percent;
            if (dfx == -1)
                return 0;
            var dfy = curves[curveIndex + 1];
            var ddfx = curves[curveIndex + 2];
            var ddfy = curves[curveIndex + 3];
            var dddfx = curves[curveIndex + 4];
            var dddfy = curves[curveIndex + 5];
            var x = dfx, y = dfy;
            var i = 10 - 2;
            while (true) {
                if (x >= percent) {
                    var lastX = x - dfx;
                    var lastY = y - dfy;
                    return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
                }
                if (i == 0)
                    break;
                i--;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
            return y + (1 - y) * (percent - x) / (1 - x);
        };
        return Curves;
    })();
    spine.Curves = Curves;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var ColorTimeline = (function () {
        function ColorTimeline(frameCount) {
            this.slotIndex = 0;
            this.curves = new spine.Curves(frameCount);
            this.frames = [];
            this.frames.length = frameCount * 5;
        }
        ColorTimeline.prototype.getFrameCount = function () {
            return this.frames.length / 5;
        };
        ColorTimeline.prototype.setFrame = function (frameIndex, time, r, g, b, a) {
            frameIndex *= 5;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = r;
            this.frames[frameIndex + 2] = g;
            this.frames[frameIndex + 3] = b;
            this.frames[frameIndex + 4] = a;
        };
        ColorTimeline.prototype.apply = function (skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0])
                return;

            var slot = skeleton.slots[this.slotIndex];

            if (time >= frames[frames.length - 5]) {
                var i = frames.length - 1;
                slot.r = frames[i - 3];
                slot.g = frames[i - 2];
                slot.b = frames[i - 1];
                slot.a = frames[i];
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 5);
            var lastFrameR = frames[frameIndex - 4];
            var lastFrameG = frames[frameIndex - 3];
            var lastFrameB = frames[frameIndex - 2];
            var lastFrameA = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex - 5] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);

            var r = lastFrameR + (frames[frameIndex + 1] - lastFrameR) * percent;
            var g = lastFrameG + (frames[frameIndex + 2] - lastFrameG) * percent;
            var b = lastFrameB + (frames[frameIndex + 3] - lastFrameB) * percent;
            var a = lastFrameA + (frames[frameIndex + 4] - lastFrameA) * percent;
            if (alpha < 1) {
                slot.r += (r - slot.r) * alpha;
                slot.g += (g - slot.g) * alpha;
                slot.b += (b - slot.b) * alpha;
                slot.a += (a - slot.a) * alpha;
            } else {
                slot.r = r;
                slot.g = g;
                slot.b = b;
                slot.a = a;
            }
        };
        return ColorTimeline;
    })();
    spine.ColorTimeline = ColorTimeline;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var SlotData = (function () {
        function SlotData(name, boneData) {
            this.name = name;
            this.boneData = boneData;
            this.r = 1;
            this.g = 1;
            this.b = 1;
            this.a = 1;
            this.additiveBlending = false;
        }
        return SlotData;
    })();
    spine.SlotData = SlotData;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var Slot = (function () {
        function Slot(data, skeleton, bone) {
            this.data = data;
            this.skeleton = skeleton;
            this.bone = bone;
            this.r = 1;
            this.g = 1;
            this.b = 1;
            this.a = 1;
            this._attachmentTime = 0;
            this.attachment = null;
            this.bone = bone;
            this.setToSetupPose();
        }
        Slot.prototype.setAttachment = function (attachment) {
            this.attachment = attachment;
            this._attachmentTime = this.skeleton.time;
        };
        Slot.prototype.setAttachmentTime = function (time) {
            this._attachmentTime = this.skeleton.time - time;
        };
        Slot.prototype.getAttachmentTime = function () {
            return this.skeleton.time - this._attachmentTime;
        };
        Slot.prototype.setToSetupPose = function () {
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
        };
        return Slot;
    })();
    spine.Slot = Slot;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var Skin = (function () {
        function Skin(name) {
            this.name = name;
            this.attachments = {};
        }
        Skin.prototype.addAttachment = function (slotIndex, name, attachment) {
            this.attachments[slotIndex + ":" + name] = attachment;
        };
        Skin.prototype.getAttachment = function (slotIndex, name) {
            return this.attachments[slotIndex + ":" + name];
        };
        Skin.prototype._attachAll = function (skeleton, oldSkin) {
            for (var key in oldSkin.attachments) {
                var colon = key.indexOf(":");
                var slotIndex = parseInt(key.substring(0, colon));
                var name = key.substring(colon + 1);
                var slot = skeleton.slots[slotIndex];
                if (slot.attachment && slot.attachment.name == name) {
                    var attachment = this.getAttachment(slotIndex, name);
                    if (attachment)
                        slot.setAttachment(attachment);
                }
            }
        };
        return Skin;
    })();
    spine.Skin = Skin;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var RotateTimeline = (function () {
        function RotateTimeline(frameCount) {
            this.boneIndex = 0;
            this.curves = new spine.Curves(frameCount);
            this.frames = [];
            this.frames.length = frameCount * 2;
        }
        RotateTimeline.prototype.getFrameCount = function () {
            return this.frames.length / 2;
        };
        RotateTimeline.prototype.setFrame = function (frameIndex, time, angle) {
            frameIndex *= 2;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = angle;
        };
        RotateTimeline.prototype.apply = function (skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0])
                return;

            var bone = skeleton.bones[this.boneIndex];

            if (time >= frames[frames.length - 2]) {
                var amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
                while (amount > 180)
                    amount -= 360;
                while (amount < -180)
                    amount += 360;
                bone.rotation += amount * alpha;
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 2);
            var lastFrameValue = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex - 2] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);

            var amount = frames[frameIndex + 1] - lastFrameValue;
            while (amount > 180)
                amount -= 360;
            while (amount < -180)
                amount += 360;
            amount = bone.data.rotation + (lastFrameValue + amount * percent) - bone.rotation;
            while (amount > 180)
                amount -= 360;
            while (amount < -180)
                amount += 360;
            bone.rotation += amount * alpha;
        };
        return RotateTimeline;
    })();
    spine.RotateTimeline = RotateTimeline;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var RegionAttachment = (function () {
        function RegionAttachment() {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.width = 0;
            this.height = 0;
            this.regionOffsetX = 0;
            this.regionOffsetY = 0;
            this.regionWidth = 0;
            this.regionHeight = 0;
            this.regionOriginalWidth = 0;
            this.regionOriginalHeight = 0;
            this.offset = [];
            this.offset.length = 8;
            this.uvs = [];
            this.uvs.length = 8;
        }
        RegionAttachment.prototype.setUVs = function (u, v, u2, v2, rotate) {
            var uvs = this.uvs;
            if (rotate) {
                uvs[2] = u;
                uvs[3] = v2;
                uvs[4] = u;
                uvs[5] = v;
                uvs[6] = u2;
                uvs[7] = v;
                uvs[0] = u2;
                uvs[1] = v2;
            } else {
                uvs[0] = u;
                uvs[1] = v2;
                uvs[2] = u;
                uvs[3] = v;
                uvs[4] = u2;
                uvs[5] = v;
                uvs[6] = u2;
                uvs[7] = v2;
            }
        };
        RegionAttachment.prototype.updateOffset = function () {
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
            offset[0] = localXCos - localYSin;
            offset[1] = localYCos + localXSin;
            offset[2] = localXCos - localY2Sin;
            offset[3] = localY2Cos + localXSin;
            offset[4] = localX2Cos - localY2Sin;
            offset[5] = localY2Cos + localX2Sin;
            offset[6] = localX2Cos - localYSin;
            offset[7] = localYCos + localX2Sin;
        };
        RegionAttachment.prototype.computeVertices = function (x, y, bone, vertices) {
            x += bone.worldX;
            y += bone.worldY;
            var m00 = bone.m00;
            var m01 = bone.m01;
            var m10 = bone.m10;
            var m11 = bone.m11;
            var offset = this.offset;
            vertices[0] = offset[0] * m00 + offset[1] * m01 + x;
            vertices[1] = offset[0] * m10 + offset[1] * m11 + y;
            vertices[2] = offset[2] * m00 + offset[3] * m01 + x;
            vertices[3] = offset[2] * m10 + offset[3] * m11 + y;
            vertices[4] = offset[4] * m00 + offset[5] * m01 + x;
            vertices[5] = offset[4] * m10 + offset[5] * m11 + y;
            vertices[6] = offset[6] * m00 + offset[7] * m01 + x;
            vertices[7] = offset[6] * m10 + offset[7] * m11 + y;
        };
        return RegionAttachment;
    })();
    spine.RegionAttachment = RegionAttachment;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var ScaleTimeline = (function () {
        function ScaleTimeline(frameCount) {
            this.boneIndex = 0;
            this.curves = new spine.Curves(frameCount);
            this.frames = [];
            this.frames.length = frameCount * 3;
        }
        ScaleTimeline.prototype.getFrameCount = function () {
            return this.frames.length / 3;
        };
        ScaleTimeline.prototype.setFrame = function (frameIndex, time, x, y) {
            frameIndex *= 3;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = x;
            this.frames[frameIndex + 2] = y;
        };
        ScaleTimeline.prototype.apply = function (skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0])
                return;

            var bone = skeleton.bones[this.boneIndex];

            if (time >= frames[frames.length - 3]) {
                bone.scaleX += (bone.data.scaleX - 1 + frames[frames.length - 2] - bone.scaleX) * alpha;
                bone.scaleY += (bone.data.scaleY - 1 + frames[frames.length - 1] - bone.scaleY) * alpha;
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 3);
            var lastFrameX = frames[frameIndex - 2];
            var lastFrameY = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);

            bone.scaleX += (bone.data.scaleX - 1 + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.scaleX) * alpha;
            bone.scaleY += (bone.data.scaleY - 1 + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.scaleY) * alpha;
        };
        return ScaleTimeline;
    })();
    spine.ScaleTimeline = ScaleTimeline;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var SkeletonData = (function () {
        function SkeletonData() {
            this.defaultSkin = null;
            this.bones = [];
            this.slots = [];
            this.skins = [];
            this.animations = [];
        }
        /** @return May be null. */
        SkeletonData.prototype.findBone = function (boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName)
                    return bones[i];
            return undefined;
        };

        /** @return -1 if the bone was not found. */
        SkeletonData.prototype.findBoneIndex = function (boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName)
                    return i;
            return -1;
        };

        /** @return May be null. */
        SkeletonData.prototype.findSlot = function (slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                if (slots[i].name == slotName)
                    return slots[i];
            }
            return null;
        };

        /** @return -1 if the bone was not found. */
        SkeletonData.prototype.findSlotIndex = function (slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].name == slotName)
                    return i;
            return -1;
        };

        /** @return May be null. */
        SkeletonData.prototype.findSkin = function (skinName) {
            var skins = this.skins;
            for (var i = 0, n = skins.length; i < n; i++)
                if (skins[i].name == skinName)
                    return skins[i];
            return null;
        };

        /** @return May be null. */
        SkeletonData.prototype.findAnimation = function (animationName) {
            var animations = this.animations;
            for (var i = 0, n = animations.length; i < n; i++)
                if (animations[i].name == animationName)
                    return animations[i];
            return null;
        };
        return SkeletonData;
    })();
    spine.SkeletonData = SkeletonData;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var Skeleton = (function () {
        function Skeleton(skeletonData) {
            this.x = 0;
            this.y = 0;
            this.r = 1;
            this.g = 1;
            this.b = 1;
            this.a = 1;
            this.time = 0;
            this.flipX = false;
            this.flipY = false;
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
        Skeleton.prototype.updateWorldTransform = function () {
            var flipX = this.flipX;
            var flipY = this.flipY;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].updateWorldTransform(flipX, flipY);
        };

        /** Sets the bones and slots to their setup pose values. */
        Skeleton.prototype.setToSetupPose = function () {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        };
        Skeleton.prototype.setBonesToSetupPose = function () {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].setToSetupPose();
        };
        Skeleton.prototype.setSlotsToSetupPose = function () {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                slots[i].setToSetupPose();
        };

        /** @return May return null. */
        Skeleton.prototype.getRootBone = function () {
            return this.bones.length == 0 ? null : this.bones[0];
        };

        /** @return May be null. */
        Skeleton.prototype.findBone = function (boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName)
                    return bones[i];
            return null;
        };

        /** @return -1 if the bone was not found. */
        Skeleton.prototype.findBoneIndex = function (boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName)
                    return i;
            return -1;
        };

        /** @return May be null. */
        Skeleton.prototype.findSlot = function (slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName)
                    return slots[i];
            return null;
        };

        /** @return -1 if the bone was not found. */
        Skeleton.prototype.findSlotIndex = function (slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName)
                    return i;
            return -1;
        };
        Skeleton.prototype.setSkinByName = function (skinName) {
            var skin = this.data.findSkin(skinName);
            if (!skin)
                throw "Skin not found: " + skinName;
            this.setSkin(skin);
        };

        /** Sets the skin used to look up attachments not found in the {@link SkeletonData#getDefaultSkin() default skin}. Attachments
        * from the new skin are attached if the corresponding attachment from the old skin was attached.
        * @param newSkin May be null. */
        Skeleton.prototype.setSkin = function (newSkin) {
            if (this.skin && newSkin)
                newSkin._attachAll(this, this.skin);
            this.skin = newSkin;
        };

        /** @return May be null. */
        Skeleton.prototype.getAttachmentBySlotName = function (slotName, attachmentName) {
            return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
        };

        /** @return May be null. */
        Skeleton.prototype.getAttachmentBySlotIndex = function (slotIndex, attachmentName) {
            if (this.skin) {
                var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment)
                    return attachment;
            }
            if (this.data.defaultSkin)
                return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        };

        /** @param attachmentName May be null. */
        Skeleton.prototype.setAttachment = function (slotName, attachmentName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName) {
                    var attachment = null;
                    if (attachmentName) {
                        attachment = this.getAttachmentBySlotIndex(i, attachmentName);
                        if (attachment == null)
                            throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw "Slot not found: " + slotName;
        };
        Skeleton.prototype.update = function (delta) {
            this.time += delta;
        };
        return Skeleton;
    })();
    spine.Skeleton = Skeleton;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var SkeletonJson = (function () {
        function SkeletonJson(attachmentLoader) {
            this.attachmentLoader = attachmentLoader;
            this.scale = 1;
        }
        SkeletonJson.readCurve = function (timeline, frameIndex, valueMap) {
            var curve = valueMap["curve"];
            if (!curve)
                return;
            if (curve == "stepped")
                timeline.curves.setStepped(frameIndex);
else if (curve instanceof Array)
                timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
        };
        SkeletonJson.toColor = function (hexString, colorIndex) {
            if (hexString.length != 8)
                throw "Color hexidecimal length must be 8, recieved: " + hexString;
            return parseInt(hexString.substring(colorIndex * 2, (colorIndex * 2) + 2), 16) / 255;
        };
        SkeletonJson.prototype.readSkeletonData = function (root) {
            var skeletonData = new spine.SkeletonData();

            // Bones.
            var bones = root["bones"];
            for (var i = 0, n = bones.length; i < n; i++) {
                var boneMap = bones[i];
                var parent = null;
                if (boneMap["parent"]) {
                    parent = skeletonData.findBone(boneMap["parent"]);
                    if (!parent)
                        throw "Parent bone not found: " + boneMap["parent"];
                }
                var boneData = new spine.BoneData(boneMap["name"], parent);
                boneData.length = (boneMap["length"] || 0) * this.scale;
                boneData.x = (boneMap["x"] || 0) * this.scale;
                boneData.y = (boneMap["y"] || 0) * this.scale;
                boneData.rotation = (boneMap["rotation"] || 0);
                boneData.scaleX = boneMap["scaleX"] || 1;
                boneData.scaleY = boneMap["scaleY"] || 1;
                boneData.inheritScale = boneMap["inheritScale"] || true;
                boneData.inheritRotation = boneMap["inheritRotation"] || true;
                skeletonData.bones.push(boneData);
            }

            // Slots.
            var slots = root["slots"];
            for (var i = 0, n = slots.length; i < n; i++) {
                var slotMap = slots[i];
                var boneData = skeletonData.findBone(slotMap["bone"]);
                if (!boneData)
                    throw "Slot bone not found: " + slotMap["bone"];
                var slotData = new spine.SlotData(slotMap["name"], boneData);

                var color = slotMap["color"];
                if (color) {
                    slotData.r = spine.SkeletonJson.toColor(color, 0);
                    slotData.g = spine.SkeletonJson.toColor(color, 1);
                    slotData.b = spine.SkeletonJson.toColor(color, 2);
                    slotData.a = spine.SkeletonJson.toColor(color, 3);
                }

                slotData.attachmentName = slotMap["attachment"];
                slotData.additiveBlending = slotMap["additive"];

                skeletonData.slots.push(slotData);
            }

            // Skins.
            var skins = root["skins"];
            for (var skinName in skins) {
                if (!skins.hasOwnProperty(skinName))
                    continue;
                var skinMap = skins[skinName];
                var skin = new spine.Skin(skinName);
                for (var slotName in skinMap) {
                    if (!skinMap.hasOwnProperty(slotName))
                        continue;
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    var slotEntry = skinMap[slotName];
                    for (var attachmentName in slotEntry) {
                        if (!slotEntry.hasOwnProperty(attachmentName))
                            continue;
                        var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
                        if (attachment != null)
                            skin.addAttachment(slotIndex, attachmentName, attachment);
                    }
                }
                skeletonData.skins.push(skin);
                if (skin.name == "default")
                    skeletonData.defaultSkin = skin;
            }

            // Animations.
            var animations = root["animations"];
            for (var animationName in animations) {
                if (!animations.hasOwnProperty(animationName))
                    continue;
                this.readAnimation(animationName, animations[animationName], skeletonData);
            }

            return skeletonData;
        };
        SkeletonJson.prototype.readAttachment = function (skin, name, map) {
            name = map["name"] || name;

            var type = spine.AttachmentType[map["type"] || "region"];
            var attachment = this.attachmentLoader.newAttachment(skin, type, name);

            if (type == spine.AttachmentType.region) {
                attachment.x = (map["x"] || 0) * this.scale;
                attachment.y = (map["y"] || 0) * this.scale;
                attachment.scaleX = map["scaleX"] || 1;
                attachment.scaleY = map["scaleY"] || 1;
                attachment.rotation = map["rotation"] || 0;
                attachment.width = (map["width"] || 32) * this.scale;
                attachment.height = (map["height"] || 32) * this.scale;
                attachment.updateOffset();
            }

            return attachment;
        };
        SkeletonJson.prototype.readAnimation = function (name, map, skeletonData) {
            var timelines = [];
            var duration = 0;

            var bones = map["bones"];
            for (var boneName in bones) {
                if (!bones.hasOwnProperty(boneName))
                    continue;
                var boneIndex = skeletonData.findBoneIndex(boneName);
                if (boneIndex == -1)
                    throw "Bone not found: " + boneName;
                var boneMap = bones[boneName];

                for (var timelineName in boneMap) {
                    if (!boneMap.hasOwnProperty(timelineName))
                        continue;
                    var values = boneMap[timelineName];
                    if (timelineName == "rotate") {
                        var timeline = new spine.RotateTimeline(values.length);
                        timeline.boneIndex = boneIndex;

                        var frameIndex = 0;
                        for (var i = 0, n = values.length; i < n; i++) {
                            var valueMap = values[i];
                            timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);
                            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                            frameIndex++;
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
                    } else if (timelineName == "translate" || timelineName == "scale") {
                        var timeline;
                        var timelineScale = 1;
                        if (timelineName == "scale")
                            timeline = new spine.ScaleTimeline(values.length);
else {
                            timeline = new spine.TranslateTimeline(values.length);
                            timelineScale = this.scale;
                        }
                        timeline.boneIndex = boneIndex;

                        var frameIndex = 0;
                        for (var i = 0, n = values.length; i < n; i++) {
                            var valueMap = values[i];
                            var x = (valueMap["x"] || 0) * timelineScale;
                            var y = (valueMap["y"] || 0) * timelineScale;
                            timeline.setFrame(frameIndex, valueMap["time"], x, y);
                            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                            frameIndex++;
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);
                    } else
                        throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";
                }
            }

            var slots = map["slots"];
            for (var slotName in slots) {
                if (!slots.hasOwnProperty(slotName))
                    continue;
                var slotMap = slots[slotName];
                var slotIndex = skeletonData.findSlotIndex(slotName);

                for (var timelineName in slotMap) {
                    if (!slotMap.hasOwnProperty(timelineName))
                        continue;
                    var values = slotMap[timelineName];
                    if (timelineName == "color") {
                        var timeline = new spine.ColorTimeline(values.length);
                        timeline.slotIndex = slotIndex;

                        var frameIndex = 0;
                        for (var i = 0, n = values.length; i < n; i++) {
                            var valueMap = values[i];
                            var color = valueMap["color"];
                            var r = spine.SkeletonJson.toColor(color, 0);
                            var g = spine.SkeletonJson.toColor(color, 1);
                            var b = spine.SkeletonJson.toColor(color, 2);
                            var a = spine.SkeletonJson.toColor(color, 3);
                            timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);
                            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                            frameIndex++;
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);
                    } else if (timelineName == "attachment") {
                        var timeline = new spine.AttachmentTimeline(values.length);
                        timeline.slotIndex = slotIndex;

                        var frameIndex = 0;
                        for (var i = 0, n = values.length; i < n; i++) {
                            var valueMap = values[i];
                            timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                    } else
                        throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";
                }
            }

            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        };
        return SkeletonJson;
    })();
    spine.SkeletonJson = SkeletonJson;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    function binarySearch(values, target, step) {
        var low = 0;
        var high = Math.floor(values.length / step) - 2;
        if (high == 0)
            return step;
        var current = high >>> 1;
        while (true) {
            if (values[(current + 1) * step] <= target)
                low = current + 1;
else
                high = current;
            if (low == high)
                return (low + 1) * step;
            current = (low + high) >>> 1;
        }
    }
    spine.binarySearch = binarySearch;
    ;
    function linearSearch(values, target, step) {
        for (var i = 0, last = values.length - step; i <= last; i += step)
            if (values[i] > target)
                return i;
        return -1;
    }
    spine.linearSearch = linearSearch;
    ;
})(spine || (spine = {}));
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
var spine;
(function (spine) {
    var TranslateTimeline = (function () {
        function TranslateTimeline(frameCount) {
            this.boneIndex = 0;
            this.curves = new spine.Curves(frameCount);
            this.frames = [];
            this.frames.length = frameCount * 3;
        }
        TranslateTimeline.prototype.getFrameCount = function () {
            return this.frames.length / 3;
        };
        TranslateTimeline.prototype.setFrame = function (frameIndex, time, x, y) {
            frameIndex *= 3;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = x;
            this.frames[frameIndex + 2] = y;
        };
        TranslateTimeline.prototype.apply = function (skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0])
                return;

            var bone = skeleton.bones[this.boneIndex];

            if (time >= frames[frames.length - 3]) {
                bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;
                bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;
                return;
            }

            // Interpolate between the last frame and the current frame.
            var frameIndex = spine.binarySearch(frames, time, 3);
            var lastFrameX = frames[frameIndex - 2];
            var lastFrameY = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);

            bone.x += (bone.data.x + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.x) * alpha;
            bone.y += (bone.data.y + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.y) * alpha;
        };
        return TranslateTimeline;
    })();
    spine.TranslateTimeline = TranslateTimeline;
})(spine || (spine = {}));
//# sourceMappingURL=spine.js.map
