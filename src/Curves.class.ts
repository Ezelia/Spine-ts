module spine {
    export class Curves {
        public curves: any[];
        constructor(frameCount) {
            this.curves = []; // dfx, dfy, ddfx, ddfy, dddfx, dddfy, ...
            this.curves.length = (frameCount - 1) * 6;
        }
        public setLinear(frameIndex) {
            this.curves[frameIndex * 6] = 0/*LINEAR*/;
        }
        public setStepped(frameIndex) {
            this.curves[frameIndex * 6] = -1/*STEPPED*/;
        }

        /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
        * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
        * the difference between the keyframe's values. */
        public setCurve(frameIndex, cx1, cy1, cx2, cy2) {
            var subdiv_step = 1 / 10/*BEZIER_SEGMENTS*/;
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
        }
        public getCurvePercent(frameIndex, percent) {
            percent = percent < 0 ? 0 : (percent > 1 ? 1 : percent);
            var curveIndex = frameIndex * 6;
            var curves = this.curves;
            var dfx = curves[curveIndex];
            if (!dfx/*LINEAR*/) return percent;
            if (dfx == -1/*STEPPED*/) return 0;
            var dfy = curves[curveIndex + 1];
            var ddfx = curves[curveIndex + 2];
            var ddfy = curves[curveIndex + 3];
            var dddfx = curves[curveIndex + 4];
            var dddfy = curves[curveIndex + 5];
            var x = dfx, y = dfy;
            var i = 10/*BEZIER_SEGMENTS*/ - 2;
            while (true) {
                if (x >= percent) {
                    var lastX = x - dfx;
                    var lastY = y - dfy;
                    return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
                }
                if (i == 0) break;
                i--;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
            return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
        }

    }
}