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
        Animation.prototype.apply = function (skeleton, lastTime, time, loop, events) {
            if (loop && this.duration != 0) {
                time %= this.duration;
                lastTime %= this.duration;
            }
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, lastTime, time, events, 1);
        };
        Animation.prototype.mix = function (skeleton, lastTime, time, loop, events, alpha) {
            if (loop && this.duration != 0) {
                time %= this.duration;
                lastTime %= this.duration;
            }
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, lastTime, time, events, alpha);
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
            this.timeScale = 1;
            this.tracks = [];
            this.events = [];
        }
        AnimationState.prototype.update = function (delta) {
            delta *= this.timeScale;
            for (var i = 0; i < this.tracks.length; i++) {
                var current = this.tracks[i];
                if (!current)
                    continue;

                var trackDelta = delta * current.timeScale;

                current.time += trackDelta;

                if (current.previous) {
                    current.previous.time += trackDelta;
                    current.mixTime += trackDelta;
                }

                var next = current.next;
                if (next) {
                    if (current.lastTime >= next.delay)
                        this.setCurrent(i, next);
                } else {
                    // End non-looping animation when it reaches its end time and there is no next entry.
                    if (!current.loop && current.lastTime >= current.endTime)
                        this.clearTrack(i);
                }
            }
        };
        AnimationState.prototype.apply = function (skeleton) {
            for (var i = 0; i < this.tracks.length; i++) {
                var current = this.tracks[i];
                if (!current)
                    continue;

                this.events.length = 0;

                var time = current.time;

                var lastTime = current.lastTime;
                var endTime = current.endTime;
                var loop = current.loop;
                if (!loop && time > endTime)
                    time = endTime;

                var previous = current.previous;
                if (!previous)
                    current.animation.apply(skeleton, current.lastTime, time, loop, this.events);
                else {
                    var previousTime = previous.time;
                    if (!previous.loop && previousTime > previous.endTime)
                        previousTime = previous.endTime;
                    previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);

                    var alpha = current.mixTime / current.mixDuration;
                    if (alpha >= 1) {
                        alpha = 1;
                        current.previous = null;
                    }
                    current.animation.mix(skeleton, current.lastTime, time, loop, this.events, alpha);
                }

                for (var ii = 0, nn = this.events.length; ii < nn; ii++) {
                    var event = this.events[ii];
                    if (current.onEvent != null)
                        current.onEvent(i, event);
                    if (this.onEvent != null)
                        this.onEvent(i, event);
                }

                // Check if completed the animation or a loop iteration.
                if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {
                    var count = Math.floor(time / endTime);
                    if (current.onComplete)
                        current.onComplete(i, count);
                    if (this.onComplete)
                        this.onComplete(i, count);
                }

                current.lastTime = current.time;
            }
        };
        AnimationState.prototype.clearTracks = function () {
            for (var i = 0, n = this.tracks.length; i < n; i++)
                this.clearTrack(i);
            this.tracks.length = 0;
        };
        AnimationState.prototype.clearTrack = function (trackIndex) {
            if (trackIndex >= this.tracks.length)
                return;
            var current = this.tracks[trackIndex];
            if (!current)
                return;

            if (current.onEnd != null)
                current.onEnd(trackIndex);
            if (this.onEnd != null)
                this.onEnd(trackIndex);

            this.tracks[trackIndex] = null;
        };
        AnimationState.prototype._expandToIndex = function (index) {
            if (index < this.tracks.length)
                return this.tracks[index];
            while (index >= this.tracks.length)
                this.tracks.push(null);
            return null;
        };
        AnimationState.prototype.setCurrent = function (index, entry) {
            var current = this._expandToIndex(index);
            if (current) {
                var previous = current.previous;
                current.previous = null;

                if (current.onEnd != null)
                    current.onEnd(index);
                if (this.onEnd != null)
                    this.onEnd(index);

                entry.mixDuration = this.data.getMix(current.animation, entry.animation);
                if (entry.mixDuration > 0) {
                    entry.mixTime = 0;

                    // If a mix is in progress, mix from the closest animation.
                    if (previous && current.mixTime / current.mixDuration < 0.5)
                        entry.previous = previous;
                    else
                        entry.previous = current;
                }
            }

            this.tracks[index] = entry;

            if (entry.onStart != null)
                entry.onStart(index);
            if (this.onStart != null)
                this.onStart(index);
        };

        AnimationState.prototype.setAnimationByName = function (trackIndex, animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation)
                throw "Animation not found: " + animationName;
            this.setAnimation(trackIndex, animation, loop);
        };

        /** Set the current animation. Any queued animations are cleared. */
        AnimationState.prototype.setAnimation = function (trackIndex, animation, loop) {
            var entry = new spine.TrackEntry();
            entry.animation = animation;
            entry.loop = loop;
            entry.endTime = animation.duration;
            this.setCurrent(trackIndex, entry);
            return entry;
        };

        AnimationState.prototype.addAnimationByName = function (trackIndex, animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation)
                throw "Animation not found: " + animationName;
            this.addAnimation(trackIndex, animation, loop, delay);
        };

        /** Adds an animation to be played delay seconds after the current or last queued animation.
        * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
        AnimationState.prototype.addAnimation = function (trackIndex, animation, loop, delay) {
            var entry = new spine.TrackEntry();
            entry.animation = animation;
            entry.loop = loop;

            entry.endTime = animation.duration;

            var last = this._expandToIndex(trackIndex);
            if (last) {
                while (last.next)
                    last = last.next;
                last.next = entry;
            } else
                this.tracks[trackIndex] = entry;

            if (delay <= 0) {
                if (last)
                    delay += last.endTime - this.data.getMix(last.animation, animation);
                else
                    delay = 0;
            }
            entry.delay = delay;

            return entry;
        };

        /** May be null. */
        AnimationState.prototype.getCurrent = function (trackIndex) {
            if (trackIndex >= this.tracks.length)
                return null;
            return this.tracks[trackIndex];
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
            this.frames = []; // time, ...
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
        AttachmentTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
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

                    textureLoader.load(page, line, this);

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
                case spine.AttachmentType.boundingBox:
                    return new spine.BoundingBoxAttachment(name);

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
        AttachmentType.boundingBox = 1;
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
            this.curves = []; // dfx, dfy, ddfx, ddfy, dddfx, dddfy, ...
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
            var subdiv_step = 1 / 10;
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
            this.frames = []; // time, r, g, b, a, ...
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
        ColorTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
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
var spine;
(function (spine) {
    var BoundingBoxAttachment = (function () {
        function BoundingBoxAttachment(name) {
            this.name = name;
            this.type = spine.AttachmentType.boundingBox;
            this.vertices = [];
        }
        BoundingBoxAttachment.prototype.computeWorldVertices = function (x, y, bone, worldVertices) {
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
        };
        return BoundingBoxAttachment;
    })();
    spine.BoundingBoxAttachment = BoundingBoxAttachment;
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
            this.frames = []; // time, angle, ...
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
        RotateTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
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
        function RegionAttachment(name) {
            this.name = name;
            this.type = spine.AttachmentType.region;
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
var spine;
(function (spine) {
    var EventTimeline = (function () {
        function EventTimeline(frameCount) {
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.events = [];
            this.events.length = frameCount;
        }
        EventTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        EventTimeline.prototype.setFrame = function (frameIndex, time, event) {
            this.frames[frameIndex] = time;
            this.events[frameIndex] = event;
        };

        /** Fires events for frames > lastTime and <= time. */
        EventTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
            if (!firedEvents)
                return;

            var frames = this.frames;
            var frameCount = frames.length;

            if (lastTime > time) {
                this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha);
                lastTime = -1;
            } else if (lastTime >= frames[frameCount - 1])
                return;
            if (time < frames[0])
                return;

            var frameIndex;
            if (lastTime < frames[0])
                frameIndex = 0;
            else {
                frameIndex = spine.binarySearch(frames, lastTime, 1);
                var frame = frames[frameIndex];
                while (frameIndex > 0) {
                    if (frames[frameIndex - 1] != frame)
                        break;
                    frameIndex--;
                }
            }
            var events = this.events;
            for (; frameIndex < frameCount && time >= frames[frameIndex]; frameIndex++)
                firedEvents.push(events[frameIndex]);
        };
        return EventTimeline;
    })();
    spine.EventTimeline = EventTimeline;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var DrawOrderTimeline = (function () {
        function DrawOrderTimeline(frameCount) {
            this.frames = []; // time, ...
            this.frames.length = frameCount;
            this.drawOrders = [];
            this.drawOrders.length = frameCount;
        }
        DrawOrderTimeline.prototype.getFrameCount = function () {
            return this.frames.length;
        };
        DrawOrderTimeline.prototype.setFrame = function (frameIndex, time, drawOrder) {
            this.frames[frameIndex] = time;
            this.drawOrders[frameIndex] = drawOrder;
        };
        DrawOrderTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
            var frames = this.frames;
            if (time < frames[0])
                return;

            var frameIndex;
            if (time >= frames[frames.length - 1])
                frameIndex = frames.length - 1;
            else
                frameIndex = spine.binarySearch(frames, time, 1) - 1;

            var drawOrder = skeleton.drawOrder;
            var slots = skeleton.slots;
            var drawOrderToSetupIndex = this.drawOrders[frameIndex];
            if (!drawOrderToSetupIndex) {
                for (var i = 0, n = slots.length; i < n; i++)
                    drawOrder[i] = slots[i];
            } else {
                for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = skeleton.slots[drawOrderToSetupIndex[i]];
            }
        };
        return DrawOrderTimeline;
    })();
    spine.DrawOrderTimeline = DrawOrderTimeline;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var EventData = (function () {
        function EventData(name) {
            this.name = name;
            this.intValue = 0;
            this.floatValue = 0;
        }
        return EventData;
    })();
    spine.EventData = EventData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var Event = (function () {
        function Event(data) {
            this.data = data;
            this.intValue = 0;
            this.floatValue = 0;
        }
        return Event;
    })();
    spine.Event = Event;
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
            this.frames = []; // time, x, y, ...
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
        ScaleTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
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
        SkeletonData.prototype.findEvent = function (eventName) {
            var events = this.events;
            for (var i = 0, n = events.length; i < n; i++)
                if (events[i].name == eventName)
                    return events[i];
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
                slots[i].setToSetupPose(); //FIXME : no i parameter ?? setToSetupPose(i) => setToSetupPose()
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
                        attachment = this.getAttachmentBySlotIndex(i, attachmentName); //FIXME : PR  getAttachment => getAttachmentBySlotIndex
                        if (!attachment)
                            throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw "Slot not found: " + slotName;
        };
        Skeleton.prototype.update = function (delta) {
            this.time += delta; //FIXME : PR time => this.time
        };
        return Skeleton;
    })();
    spine.Skeleton = Skeleton;
})(spine || (spine = {}));
var spine;
(function (spine) {
    var SkeletonBounds = (function () {
        function SkeletonBounds() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.polygonPool = [];
            this.polygons = [];
            this.boundingBoxes = [];
        }
        SkeletonBounds.prototype.update = function (skeleton, updateAabb) {
            var slots = skeleton.slots;
            var slotCount = slots.length;
            var x = skeleton.x, y = skeleton.y;
            var boundingBoxes = this.boundingBoxes;
            var polygonPool = this.polygonPool;
            var polygons = this.polygons;
            var polygon;
            boundingBoxes.length = 0;
            for (var i = 0, n = polygons.length; i < n; i++)
                polygonPool.push(polygons[i]);
            polygons.length = 0;

            for (var i = 0; i < slotCount; i++) {
                var slot = slots[i];
                var boundingBox = slot.attachment;
                if (boundingBox.type != spine.AttachmentType.boundingBox)
                    continue;
                boundingBoxes.push(boundingBox);

                var poolCount = polygonPool.length;
                if (poolCount > 0) {
                    polygon = polygonPool[poolCount - 1];
                    polygonPool.splice(poolCount - 1, 1);
                } else
                    polygon = [];
                polygons.push(polygon);

                polygon.length = boundingBox.vertices.length;
                boundingBox.computeWorldVertices(x, y, slot.bone, polygon);
            }

            if (updateAabb)
                this.aabbCompute();
        };

        SkeletonBounds.prototype.aabbCompute = function () {
            var polygons = this.polygons;
            var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
            for (var i = 0, n = polygons.length; i < n; i++) {
                var vertices = polygons[i];
                for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                    var x = vertices[ii];
                    var y = vertices[ii + 1];
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
        };

        /** Returns true if the axis aligned bounding box contains the point. */
        SkeletonBounds.prototype.aabbContainsPoint = function (x, y) {
            return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
        };

        /** Returns true if the axis aligned bounding box intersects the line segment. */
        SkeletonBounds.prototype.aabbIntersectsSegment = function (x1, y1, x2, y2) {
            var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
            if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
                return false;
            var m = (y2 - y1) / (x2 - x1);
            var y = m * (minX - x1) + y1;
            if (y > minY && y < maxY)
                return true;
            y = m * (maxX - x1) + y1;
            if (y > minY && y < maxY)
                return true;
            var x = (minY - y1) / m + x1;
            if (x > minX && x < maxX)
                return true;
            x = (maxY - y1) / m + x1;
            if (x > minX && x < maxX)
                return true;
            return false;
        };

        /** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
        SkeletonBounds.prototype.aabbIntersectsSkeleton = function (bounds) {
            return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
        };

        /** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
        * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
        SkeletonBounds.prototype.containsPoint = function (x, y) {
            var polygons = this.polygons;
            for (var i = 0, n = polygons.length; i < n; i++)
                if (this.polygonContainsPoint(polygons[i], x, y))
                    return this.boundingBoxes[i];
            return null;
        };

        /** Returns the first bounding box attachment that contains the line segment, or null. When doing many checks, it is usually
        * more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns true. */
        //FIXME : duplicate intersectsSegment
        //public intersectsSegment(x1, y1, x2, y2) {
        //    var polygons = this.polygons;
        //    for (var i = 0, n = polygons.length; i < n; i++)
        //        if (polygons[i].intersectsSegment(x1, y1, x2, y2)) return boundingBoxes[i];
        //    return null;
        //}
        /** Returns true if the polygon contains the point. */
        SkeletonBounds.prototype.polygonContainsPoint = function (polygon, x, y) {
            var nn = polygon.length;
            var prevIndex = nn - 2;
            var inside = false;
            for (var ii = 0; ii < nn; ii += 2) {
                var vertexY = polygon[ii + 1];
                var prevY = polygon[prevIndex + 1];
                if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
                    var vertexX = polygon[ii];
                    if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x)
                        inside = !inside;
                }
                prevIndex = ii;
            }
            return inside;
        };

        /** Returns true if the polygon contains the line segment. */
        SkeletonBounds.prototype.intersectsSegment = function (polygon, x1, y1, x2, y2) {
            var nn = polygon.length;
            var width12 = x1 - x2, height12 = y1 - y2;
            var det1 = x1 * y2 - y1 * x2;
            var x3 = polygon[nn - 2], y3 = polygon[nn - 1];
            for (var ii = 0; ii < nn; ii += 2) {
                var x4 = polygon[ii], y4 = polygon[ii + 1];
                var det2 = x3 * y4 - y3 * x4;
                var width34 = x3 - x4, height34 = y3 - y4;
                var det3 = width12 * height34 - height12 * width34;
                var x = (det1 * width34 - width12 * det2) / det3;
                if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
                    var y = (det1 * height34 - height12 * det2) / det3;
                    if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)))
                        return true;
                }
                x3 = x4;
                y3 = y4;
            }
            return false;
        };
        SkeletonBounds.prototype.getPolygon = function (attachment) {
            var index = this.boundingBoxes.indexOf(attachment);
            return index == -1 ? null : this.polygons[index];
        };
        SkeletonBounds.prototype.getWidth = function () {
            return this.maxX - this.minX;
        };
        SkeletonBounds.prototype.getHeight = function () {
            return this.maxY - this.minY;
        };
        return SkeletonBounds;
    })();
    spine.SkeletonBounds = SkeletonBounds;
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
                boneData.inheritScale = !boneMap["inheritScale"] || boneMap["inheritScale"] == "true";
                boneData.inheritRotation = !boneMap["inheritRotation"] || boneMap["inheritRotation"] == "true";
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
                slotData.additiveBlending = slotMap["additive"] && slotMap["additive"] == "true";

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

            // Events.
            var events = root["events"];
            for (var eventName in events) {
                if (!events.hasOwnProperty(eventName))
                    continue;
                var eventMap = events[eventName];
                var eventData = new spine.EventData(eventName);
                eventData.intValue = eventMap["int"] || 0;
                eventData.floatValue = eventMap["float"] || 0;
                eventData.stringValue = eventMap["string"] || null;
                skeletonData.events.push(eventData);
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
            } else if (type == spine.AttachmentType.boundingBox) {
                var vertices = map["vertices"];
                for (var i = 0, n = vertices.length; i < n; i++)
                    attachment.vertices.push(vertices[i] * this.scale);
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

            var events = map["events"];
            if (events) {
                var timeline = new spine.EventTimeline(events.length);
                var frameIndex = 0;
                for (var i = 0, n = events.length; i < n; i++) {
                    var eventMap = events[i];
                    var eventData = skeletonData.findEvent(eventMap["name"]);
                    if (!eventData)
                        throw "Event not found: " + eventMap["name"];
                    var event = new spine.Event(eventData);
                    event.intValue = eventMap.hasOwnProperty("int") ? eventMap["int"] : eventData.intValue;
                    event.floatValue = eventMap.hasOwnProperty("float") ? eventMap["float"] : eventData.floatValue;
                    event.stringValue = eventMap.hasOwnProperty("string") ? eventMap["string"] : eventData.stringValue;
                    timeline.setFrame(frameIndex++, eventMap["time"], event);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }

            var drawOrderValues = map["draworder"];
            if (drawOrderValues) {
                var timeline = new spine.DrawOrderTimeline(drawOrderValues.length);
                var slotCount = skeletonData.slots.length;
                var frameIndex = 0;
                for (var i = 0, n = drawOrderValues.length; i < n; i++) {
                    var drawOrderMap = drawOrderValues[i];
                    var drawOrder = null;
                    if (drawOrderMap["offsets"]) {
                        drawOrder = [];
                        drawOrder.length = slotCount;
                        for (var ii = slotCount - 1; ii >= 0; ii--)
                            drawOrder[ii] = -1;
                        var offsets = drawOrderMap["offsets"];
                        var unchanged = [];
                        unchanged.length = slotCount - offsets.length;
                        var originalIndex = 0, unchangedIndex = 0;
                        for (var ii = 0, nn = offsets.length; ii < nn; ii++) {
                            var offsetMap = offsets[ii];
                            var slotIndex = skeletonData.findSlotIndex(offsetMap["slot"]);
                            if (slotIndex == -1)
                                throw "Slot not found: " + offsetMap["slot"];

                            while (originalIndex != slotIndex)
                                unchanged[unchangedIndex++] = originalIndex++;

                            // Set changed items.
                            drawOrder[originalIndex + offsetMap["offset"]] = originalIndex++;
                        }

                        while (originalIndex < slotCount)
                            unchanged[unchangedIndex++] = originalIndex++;

                        for (var ii = slotCount - 1; ii >= 0; ii--)
                            if (drawOrder[ii] == -1)
                                drawOrder[ii] = unchanged[--unchangedIndex];
                    }
                    timeline.setFrame(frameIndex++, drawOrderMap["time"], drawOrder);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
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
            this.frames = []; // time, x, y, ...
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
        TranslateTimeline.prototype.apply = function (skeleton, lastTime, time, firedEvents, alpha) {
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
var spine;
(function (spine) {
    var TrackEntry = (function () {
        function TrackEntry() {
            this.next = null;
            this.previous = null;
            this.animation = null;
            this.loop = false;
            this.delay = 0;
            this.time = 0;
            this.lastTime = -1;
            this.endTime = 0;
            this.timeScale = 1;
            this.mixTime = 0;
            this.mixDuration = 0;
        }
        return TrackEntry;
    })();
    spine.TrackEntry = TrackEntry;
})(spine || (spine = {}));
//# sourceMappingURL=spine.js.map
