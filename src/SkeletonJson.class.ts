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
    export class SkeletonJson {
        public scale: number = 1;
        constructor(public attachmentLoader) {
        }

        public static readCurve(timeline, frameIndex, valueMap) {
            var curve = valueMap["curve"];
            if (!curve) return;
            if (curve == "stepped")
                timeline.curves.setStepped(frameIndex);
            else if (curve instanceof Array)
                timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
        }
        public static toColor(hexString, colorIndex) {
            if (hexString.length != 8) throw "Color hexidecimal length must be 8, recieved: " + hexString;
            return parseInt(hexString.substring(colorIndex * 2, (colorIndex * 2) + 2), 16) / 255;
        }
        public readSkeletonData(root) {
            var skeletonData = new spine.SkeletonData();

            // Bones.
            var bones = root["bones"];
            for (var i = 0, n = bones.length; i < n; i++) {
                var boneMap = bones[i];
                var parent = null;
                if (boneMap["parent"]) {
                    parent = skeletonData.findBone(boneMap["parent"]);
                    if (!parent) throw "Parent bone not found: " + boneMap["parent"];
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
                if (!boneData) throw "Slot bone not found: " + slotMap["bone"];
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
                if (!skins.hasOwnProperty(skinName)) continue;
                var skinMap = skins[skinName];
                var skin = new spine.Skin(skinName);
                for (var slotName in skinMap) {
                    if (!skinMap.hasOwnProperty(slotName)) continue;
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    var slotEntry = skinMap[slotName];
                    for (var attachmentName in slotEntry) {
                        if (!slotEntry.hasOwnProperty(attachmentName)) continue;
                        var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
                        if (attachment != null) skin.addAttachment(slotIndex, attachmentName, attachment);
                    }
                }
                skeletonData.skins.push(skin);
                if (skin.name == "default") skeletonData.defaultSkin = skin;
            }

            // Animations.
            var animations = root["animations"];
            for (var animationName in animations) {
                if (!animations.hasOwnProperty(animationName)) continue;
                this.readAnimation(animationName, animations[animationName], skeletonData);
            }

            return skeletonData;
        }
        public readAttachment(skin, name, map) {
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
        }
        public readAnimation(name, map, skeletonData) {
            var timelines = [];
            var duration = 0;

            var bones = map["bones"];
            for (var boneName in bones) {
                if (!bones.hasOwnProperty(boneName)) continue;
                var boneIndex = skeletonData.findBoneIndex(boneName);
                if (boneIndex == -1) throw "Bone not found: " + boneName;
                var boneMap = bones[boneName];

                for (var timelineName in boneMap) {
                    if (!boneMap.hasOwnProperty(timelineName)) continue;
                    var values = boneMap[timelineName];
                    if (timelineName == "rotate") {
                        var timeline:any = new spine.RotateTimeline(values.length);
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
                        var timeline: any;
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
                if (!slots.hasOwnProperty(slotName)) continue;
                var slotMap = slots[slotName];
                var slotIndex = skeletonData.findSlotIndex(slotName);

                for (var timelineName in slotMap) {
                    if (!slotMap.hasOwnProperty(timelineName)) continue;
                    var values = slotMap[timelineName];
                    if (timelineName == "color") {
                        var timeline: any = new spine.ColorTimeline(values.length);
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
                        var timeline: any = new spine.AttachmentTimeline(values.length);
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
        }
    }
}