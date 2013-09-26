declare module spine {
    class Animation {
        public name;
        public timelines;
        public duration;
        constructor(name, timelines, duration);
        public apply(skeleton, time, loop): void;
        public mix(skeleton, time, loop, alpha): void;
    }
}
declare module spine {
    class AnimationStateData {
        public skeletonData: spine.SkeletonData;
        public animationToMixTime: any;
        public defaultMix: number;
        constructor(skeletonData: spine.SkeletonData);
        public setMixByName(fromName, toName, duration): void;
        public setMix(from, to, duration): void;
        public getMix(from, to);
    }
}
declare module spine {
    class AnimationState {
        public data: spine.AnimationStateData;
        public queue: any[];
        public current;
        public previous;
        public currentTime: number;
        public previousTime: number;
        public currentLoop: boolean;
        public previousLoop: boolean;
        public mixTime: number;
        public mixDuration: number;
        constructor(data: spine.AnimationStateData);
        public update(delta): void;
        public apply(skeleton: spine.Skeleton): void;
        public clearAnimation(): void;
        private _setAnimation(animation, loop);
        /** @see #setAnimation(Animation, Boolean) */
        public setAnimationByName(animationName, loop): void;
        /** Set the current animation. Any queued animations are cleared and the current animation time is set to 0.
        * @param animation May be null. */
        public setAnimation(animation, loop): void;
        /** @see #addAnimation(Animation, Boolean, Number) */
        public addAnimationByName(animationName, loop, delay): void;
        /** Adds an animation to be played delay seconds after the current or last queued animation.
        * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
        public addAnimation(animation, loop, delay): void;
        /** Returns true if no animation is set or if the current time is greater than the animation duration, regardless of looping. */
        public isComplete(): boolean;
    }
}
declare module spine {
    class BoneData {
        public name;
        public parent;
        public length: number;
        public x: number;
        public y: number;
        public rotation: number;
        public inheritScale: boolean;
        public inheritRotation: boolean;
        public scaleX: number;
        public scaleY: number;
        constructor(name, parent);
    }
}
declare module spine {
    class Bone {
        public data;
        public parent: any;
        static yDown: boolean;
        public name: string;
        public x: number;
        public y: number;
        public rotation: number;
        public scaleX: number;
        public scaleY: number;
        public m00: number;
        public m01: number;
        public worldX: number;
        public m10: number;
        public m11: number;
        public worldY: number;
        public worldRotation: number;
        public worldScaleX: number;
        public worldScaleY: number;
        constructor(data, parent: any);
        public updateWorldTransform(flipX, flipY): void;
        public setToSetupPose(): void;
    }
}
declare module spine {
    class AttachmentTimeline {
        public slotIndex: number;
        public curves;
        public Curves;
        public frames: any[];
        public attachmentNames: any[];
        constructor(frameCount);
        public getFrameCount(): number;
        public setFrame(frameIndex, time, attachmentName): void;
        public apply(skeleton, time, alpha): void;
    }
}
declare module spine {
    class Atlas {
        public atlasText;
        public textureLoader;
        public pages: any[];
        public regions: any[];
        static Format: {
            alpha: number;
            intensity: number;
            luminanceAlpha: number;
            rgb565: number;
            rgba4444: number;
            rgb888: number;
            rgba8888: number;
        };
        static TextureFilter: {
            nearest: number;
            linear: number;
            mipMap: number;
            mipMapNearestNearest: number;
            mipMapLinearNearest: number;
            mipMapNearestLinear: number;
            mipMapLinearLinear: number;
        };
        static TextureWrap: {
            mirroredRepeat: number;
            clampToEdge: number;
            repeat: number;
        };
        constructor(atlasText, textureLoader);
        public findRegion(name);
        public dispose(): void;
        public updateUVs(page): void;
    }
}
declare module spine {
    class AtlasPage {
        public name;
        public format;
        public minFilter;
        public magFilter;
        public uWrap;
        public vWrap;
        public rendererObject;
        public width;
        public height;
    }
}
declare module spine {
    class AtlasAttachmentLoader {
        public atlas;
        constructor(atlas);
        public newAttachment(skin, type, name): spine.RegionAttachment;
    }
}
declare module spine {
    class AtlasRegion {
        public page;
        public name;
        public x: number;
        public y: number;
        public width: number;
        public height: number;
        public u: number;
        public v: number;
        public u2: number;
        public v2: number;
        public offsetX: number;
        public offsetY: number;
        public originalWidth: number;
        public originalHeight: number;
        public index: number;
        public rotate: boolean;
        public splits;
        public pads;
    }
}
declare module spine {
    class AtlasReader {
        private lines;
        private index;
        constructor(text);
        public trim(value);
        public readLine();
        public readValue();
        /** Returns the number of tuple values read (2 or 4). */
        public readTuple(tuple): number;
    }
}
declare module spine {
    class AttachmentType {
        static region: number;
    }
}
declare module spine {
    class Curves {
        public curves: any[];
        constructor(frameCount);
        public setLinear(frameIndex): void;
        public setStepped(frameIndex): void;
        /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
        * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
        * the difference between the keyframe's values. */
        public setCurve(frameIndex, cx1, cy1, cx2, cy2): void;
        public getCurvePercent(frameIndex, percent);
    }
}
declare module spine {
    class ColorTimeline {
        public slotIndex: number;
        public curves;
        public Curves;
        public frames: any[];
        constructor(frameCount);
        public getFrameCount(): number;
        public setFrame(frameIndex, time, r, g, b, a): void;
        public apply(skeleton, time, alpha): void;
    }
}
declare module spine {
    class SlotData {
        public name;
        public boneData;
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        public attachmentName: string;
        public additiveBlending: boolean;
        constructor(name, boneData);
    }
}
declare module spine {
    class Slot {
        public data;
        public skeleton;
        public bone: any;
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        private _attachmentTime;
        public attachment: any;
        constructor(data, skeleton, bone: any);
        public setAttachment(attachment): void;
        public setAttachmentTime(time): void;
        public getAttachmentTime(): number;
        public setToSetupPose(): void;
    }
}
declare module spine {
    class Skin {
        public name;
        public attachments: any;
        constructor(name);
        public addAttachment(slotIndex, name, attachment): void;
        public getAttachment(slotIndex, name);
        private _attachAll(skeleton, oldSkin);
    }
}
declare module spine {
    class RotateTimeline {
        public boneIndex: number;
        public curves: spine.Curves;
        public frames: any[];
        constructor(frameCount);
        public getFrameCount(): number;
        public setFrame(frameIndex, time, angle): void;
        public apply(skeleton, time, alpha): void;
    }
}
declare module spine {
    class RegionAttachment {
        public x: number;
        public y: number;
        public rotation: number;
        public scaleX: number;
        public scaleY: number;
        public width: number;
        public height: number;
        public rendererObject;
        public regionOffsetX: number;
        public regionOffsetY: number;
        public regionWidth: number;
        public regionHeight: number;
        public regionOriginalWidth: number;
        public regionOriginalHeight: number;
        public offset: any[];
        public uvs: any[];
        constructor();
        public setUVs(u, v, u2, v2, rotate): void;
        public updateOffset(): void;
        public computeVertices(x, y, bone, vertices): void;
    }
}
declare module spine {
    class ScaleTimeline {
        public boneIndex: number;
        public curves: spine.Curves;
        public frames: any[];
        constructor(frameCount);
        public getFrameCount(): number;
        public setFrame(frameIndex, time, x, y): void;
        public apply(skeleton, time, alpha): void;
    }
}
declare module spine {
    class SkeletonData {
        public bones: spine.BoneData[];
        public slots: spine.SlotData[];
        public skins: spine.Skin[];
        public animations: any[];
        public defaultSkin: any;
        constructor();
        /** @return May be null. */
        public findBone(boneName): spine.BoneData;
        /** @return -1 if the bone was not found. */
        public findBoneIndex(boneName): number;
        /** @return May be null. */
        public findSlot(slotName): spine.SlotData;
        /** @return -1 if the bone was not found. */
        public findSlotIndex(slotName): number;
        /** @return May be null. */
        public findSkin(skinName): spine.Skin;
        /** @return May be null. */
        public findAnimation(animationName);
    }
}
declare module spine {
    class Skeleton {
        public bones: spine.Bone[];
        public slots: spine.Slot[];
        public drawOrder: any[];
        public data: spine.SkeletonData;
        public x: number;
        public y: number;
        public skin: spine.Skin;
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        public time: number;
        public flipX: boolean;
        public flipY: boolean;
        constructor(skeletonData: spine.SkeletonData);
        /** Updates the world transform for each bone. */
        public updateWorldTransform(): void;
        /** Sets the bones and slots to their setup pose values. */
        public setToSetupPose(): void;
        public setBonesToSetupPose(): void;
        public setSlotsToSetupPose(): void;
        /** @return May return null. */
        public getRootBone(): spine.Bone;
        /** @return May be null. */
        public findBone(boneName): spine.Bone;
        /** @return -1 if the bone was not found. */
        public findBoneIndex(boneName): number;
        /** @return May be null. */
        public findSlot(slotName): spine.Slot;
        /** @return -1 if the bone was not found. */
        public findSlotIndex(slotName): number;
        public setSkinByName(skinName): void;
        /** Sets the skin used to look up attachments not found in the {@link SkeletonData#getDefaultSkin() default skin}. Attachments
        * from the new skin are attached if the corresponding attachment from the old skin was attached.
        * @param newSkin May be null. */
        public setSkin(newSkin): void;
        /** @return May be null. */
        public getAttachmentBySlotName(slotName, attachmentName);
        /** @return May be null. */
        public getAttachmentBySlotIndex(slotIndex, attachmentName);
        /** @param attachmentName May be null. */
        public setAttachment(slotName, attachmentName): void;
        public update(delta: number): void;
    }
}
declare module spine {
    class SkeletonJson {
        public attachmentLoader;
        public scale: number;
        constructor(attachmentLoader);
        static readCurve(timeline, frameIndex, valueMap): void;
        static toColor(hexString, colorIndex): number;
        public readSkeletonData(root): spine.SkeletonData;
        public readAttachment(skin, name, map);
        public readAnimation(name, map, skeletonData): void;
    }
}
declare module spine {
    function binarySearch(values, target, step);
    function linearSearch(values, target, step): number;
}
declare module spine {
    class TranslateTimeline {
        public boneIndex: number;
        public curves: spine.Curves;
        public frames: any[];
        constructor(frameCount);
        public getFrameCount(): number;
        public setFrame(frameIndex, time, x, y): void;
        public apply(skeleton, time, alpha): void;
    }
}
