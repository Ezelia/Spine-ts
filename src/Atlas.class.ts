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
    export class Atlas {

        public pages: any[];
        public regions: any[];

        public static Format = {
            alpha: 0,
            intensity: 1,
            luminanceAlpha: 2,
            rgb565: 3,
            rgba4444: 4,
            rgb888: 5,
            rgba8888: 6
        }

        public static TextureFilter = {
            nearest: 0,
            linear: 1,
            mipMap: 2,
            mipMapNearestNearest: 3,
            mipMapLinearNearest: 4,
            mipMapNearestLinear: 5,
            mipMapLinearLinear: 6
        }

        public static TextureWrap = {
            mirroredRepeat: 0,
            clampToEdge: 1,
            repeat: 2
        }
        constructor(public atlasText, public textureLoader) {

            this.pages = [];
            this.regions = [];

            var reader = new spine.AtlasReader(atlasText);
            var tuple = [];
            tuple.length = 4;
            var page = null;
            while (true) {
                var line = reader.readLine();
                if (line == null) break;
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

                    if (reader.readTuple(tuple) == 4) { // split is optional
                        region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];

                        if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
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
        public findRegion(name) {
            var regions = this.regions;
            for (var i = 0, n = regions.length; i < n; i++)
                if (regions[i].name == name) return regions[i];
            return null;
        }
        public dispose() {
            var pages = this.pages;
            for (var i = 0, n = pages.length; i < n; i++)
                this.textureLoader.unload(pages[i].rendererObject);
        }
        public updateUVs(page) {
            var regions = this.regions;
            for (var i = 0, n = regions.length; i < n; i++) {
                var region = regions[i];
                if (region.page != page) continue;
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
        }
    }
}