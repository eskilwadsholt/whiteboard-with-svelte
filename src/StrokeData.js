// Number of neighbours to each side of point to make quadreg to smooth
const smoothing = 3;
const catmulRomDist = 1 / 3;

// Compute constant parts of regression
const t2 = {};
const t3 = {};
let St2 = 0;
let St4 = 0;
let St6 = 0;
for (let t = - smoothing; t <= smoothing; t++) {
    t2[t] = t * t;
    t3[t] = t2[t] * t;
    St2 += t2[t];
    St4 += t2[t] * t2[t];
    St6 += t3[t] * t3[t];
}
const N = 2 * smoothing + 1;
const S11 = St2;
const S22 = St4 - St2 * St2 / N;
// Constantss for cubic smoothing
const t6mean = St6 / N;
const t4mean = St4 / N;
const t2mean = St2 / N;
const detAC = t6mean * t2mean - t4mean * t4mean;
const detBD = t4mean - t2mean * t2mean;

export class StrokeData {

    constructor(ID, color, thickness, dash) {
        this.ID = ID;
        this.color = color;
        this.thickness = thickness;
        this.dash = dash;
        this.pixelDist = 0; // In screen pixels at time of 
        this.firstPoint = null;
        this.lastP = null;
        this.cubicSmoothPoint = null; // Middle of middles (cubic Bezier)
        this.lastQuadControl = null;
        this.points = [];
        this.quadControls = [];
        this.smoothPoints = [];

        // Timers
        this.startTime = performance.now();
        this.totalTime = 0;
        this.processTime = 0;

        // Store parts of SVG-path
        this.first = "";
        this.middle = "";
        this.ending = "";
        this.controls = "";
        this.corrections = "";

        // Circle fit variables
        this.Sxx = 0;
        this.Sx  = 0;
        this.Syy = 0;
        this.Sy  = 0;
        this.Sxy = 0;
        this.Sxw = 0;
        this.Syw = 0;
        this.Sw  = 0;

        // Determine smoothing function to use
        this.smoother = this.cubicRegSimple;
    }

    export() {
        //const { pixelDist, thickness, dash, color, firstPoint, first, middle, ending} = this;
        //return { pixelDist, thickness, dash, color, firstPoint, first, middle, ending};
        //this.cubicSmoothEnding();
        const { totalTime, processTime } = this;
        const ratio = totalTime / processTime;
        console.debug({ totalTime, processTime, ratio });
        return this;
    }

    addPixelDist(P, Q) {
        this.pixelDist += dist(P, Q);
    }

    cubicRegSimple(k) {
        let Sx = 0,
            Sxt2 = 0;
        let Sy = 0,
            Syt2 = 0;

        for (let t = -smoothing; t <= smoothing; t++) {
            const P = this.points[wrap(k + t, 0, this.points.length - 1)];
            Sx += P.x;
            Sxt2 += P.x * t2[t];
            Sy += P.y;
            Syt2 += P.y * t2[t];
        }

        const xmean   = Sx / N;
        const xt2mean = Sxt2 / N;
        const ymean   = Sy / N;
        const yt2mean = Syt2 / N;
        
        const dx = (t4mean * xmean - t2mean * xt2mean) / detBD;
        const dy = (t4mean * ymean - t2mean * yt2mean) / detBD;

        // Assign intercepts for symmetric regressions x(t), y(t) as actual x(0)-y(0)-vals
        const P = { x: dx, y: dy };

        return {
            ...P,
            controls: { before: { ...P }, after: { ...P} } };
    }

    cubicReg(k) {
        let Sx = 0,
            Sxt = 0,
            Sxt2 = 0,
            Sxt3 = 0;
        let Sy = 0,
            Syt = 0,
            Syt2 = 0,
            Syt3 = 0;

        for (let t = -smoothing; t <= smoothing; t++) {
            const P = this.points[wrap(k + t, 0, this.points.length - 1)];
            Sx += P.x;
            Sxt += P.x * t;
            Sxt2 += P.x * t2[t];
            Sxt3 += P.x * t3[t];
            Sy += P.y;
            Syt += P.y * t;
            Syt2 += P.y * t2[t];
            Syt3 += P.y * t3[t];
        }

        const xmean = Sx / N;
        const xtmean = Sxt / N;
        const xt2mean = Sxt2 / N;
        const xt3mean = Sxt3 / N;
        const ymean = Sy / N;
        const ytmean = Syt / N;
        const yt2mean = Syt2 / N;
        const yt3mean = Syt3 / N;
        
        const ax = (t2mean * xt3mean - t4mean * xtmean) / detAC;
        const ay = (t2mean * yt3mean - t4mean * ytmean) / detAC;
        const bx = (xt2mean - t2mean * xmean) / detBD;
        const by = (yt2mean - t2mean * ymean) / detBD;
        const cx = (t6mean * xtmean - t4mean * xt3mean) / detAC;
        const cy = (t6mean * ytmean - t4mean * yt3mean) / detAC;
        const dx = (t4mean * xmean - t2mean * xt2mean) / detBD;
        const dy = (t4mean * ymean - t2mean * yt2mean) / detBD;

        // Assign intercepts for symmetric regressions x(t), y(t) as actual x(0)-y(0)-vals
        const P = { x: dx, y: dy };

        return {
            ...P,
            ...{ ax, bx, cx, dx, ay, by, cy, dy },
            controls: { before: { ...P }, after: { ...P} } };
    }

    cubicSmoothEnding() {
        this.ending = "";

        const kstart = Math.max(0, this.points.length - smoothing - 1);

        let P1 = {}, P2 = {}, P3 = {};

        // Get cubic regs for last smooth point
        const { ax, bx, cx, dx, ay, by, cy, dy } = this.smoothPoints[kstart];

        for (let k = kstart + 1; k < this.points.length; k++) {
            // this.smoothPoints[k] = this.cubicReg(k);
            const t = k - kstart;
            this.smoothPoints[k] = {
                x: ax * t**3 + bx * t**2 + cx * t + dx,
                y: ay * t**3 + by * t**2 + cy * t + dy,
            }
            this.smoothPoints[k].controls = {
                before: { ...this.smoothPoints[k] },
                after: { ...this.smoothPoints[k] },
            }
            this.corrections += `M${coords(this.points[k])}L${coords(this.smoothPoints[k])}`;

            if (k > 1) {
                // Compute controls for last point
                P1 = this.smoothPoints[k - 2];
                P2 = this.smoothPoints[k - 1];
                P3 = this.smoothPoints[k];
                // Compute vectors P2 --> P1 and P2 --> P3
                const dx1 = P1.x - P2.x;
                const dy1 = P1.y - P2.y;
                const dx2 = P3.x - P2.x;
                const dy2 = P3.y - P2.y;
                // Compute tangent direction P1 --> P3
                const dx = P3.x - P1.x;
                const dy = P3.y - P1.y;
                const squareNorm = dx * dx + dy * dy;
                // Compute projections and save as controls
                if (squareNorm > 0) {
                    const before = catmulRomDist * (dx * dx1 + dy * dy1) / squareNorm;
                    P2.controls.before.x = P2.x + dx * before;
                    P2.controls.before.y = P2.y + dy * before;
                    const after = catmulRomDist * (dx * dx2 + dy * dy2) / squareNorm;
                    P2.controls.after.x = P2.x + dx * after;
                    P2.controls.after.y = P2.y + dy * after;
                }
                //this.controls += `M${coords(P2.controls.before)}L${coords(P2.controls.after)}`;
                this.ending += `C${coords(P1.controls.after)} ${coords(P2.controls.before)} ${coords(P2)}`;
            }
        }
        if (P2.controls) this.ending += `Q${coords(P2.controls.after)} ${coords(P3)}`;
    }

    addPointCubicReg(P) {

        let newP = { ...P };

        if (this.lastP) {
            newP = {
                x: 0.5 * (this.lastP.x + P.x),
                y: 0.5 * (this.lastP.y + P.y),
            }
        }

        this.points.push({
            ...newP,
            controls: { before: { ...newP }, after: { ...newP } } 
        });
        
        const kstart = Math.max(0, this.points.length - smoothing - 1);

        // Skip nesting of for-loops - only compute smoothing when enough data on both sides of point
        this.smoothPoints[kstart] = this.cubicReg(kstart);

        this.cubicSmoothEnding();
        /*
        this.ending = "";
        for (let k = kstart + 1; k < this.points.length; k++) {
            this.ending += `L${coords(this.points[k])}`;
        }
        */

        this.corrections += `M${coords(this.points[kstart])}L${coords(this.smoothPoints[kstart])}`;
        
        if (kstart > 1) {
            /*
            // Compute controls for last point
            const P1 = this.smoothPoints[kstart - 2];
            const P2 = this.smoothPoints[kstart - 1];
            const P3 = this.smoothPoints[kstart];
            // Compute vectors P2 --> P1 and P2 --> P3
            const dx1 = P1.x - P2.x;
            const dy1 = P1.y - P2.y;
            const dx2 = P3.x - P2.x;
            const dy2 = P3.y - P2.y;
            // Compute tangent direction P1 --> P3
            const dx = P3.x - P1.x;
            const dy = P3.y - P1.y;
            const squareNorm = dx * dx + dy * dy;
            // Compute projections and save as controls
            if (squareNorm > 0) {
                const before = catmulRomDist * (dx * dx1 + dy * dy1) / squareNorm;
                P2.controls.before.x = P2.x + dx * before;
                P2.controls.before.y = P2.y + dy * before;
                const after = catmulRomDist * (dx * dx2 + dy * dy2) / squareNorm;
                P2.controls.after.x = P2.x + dx * after;
                P2.controls.after.y = P2.y + dy * after;
            }*/

            // Use cubic regression to compute controls for last point
            const P3 = this.smoothPoints[kstart];

            let { cx, cy } = P3;

            cx = catmulRomDist * cx;
            cy = catmulRomDist * cy;

            P3.controls = {
                before: { x: P3.x - cx, y: P3.y - cy },
                after: { x: P3.x + cx, y: P3.y + cy },
            }

            this.controls += `M${coords(P3.controls.before)}L${coords(P3.controls.after)}`;
            this.middle += `S${coords(P3.controls.before)} ${coords(P3)}`;
        } else {
            this.first = `M ${coords(this.points[0])}`;
            this.firstPoint = this.points[0];
        }

        if (this.smoothPoints[0]) this.first = `M ${coords(this.smoothPoints[0])}`;

        this.lastP = P;

    }

    addPoint(P) {
        const processStart = performance.now();
        this.addPointCubicReg(P);
        this.totalTime = performance.now() - this.startTime;
        this.processTime += performance.now() - processStart;
    }

    addPoint6(P) {
        // 6th degree version - still cubic segments
        this.points.push(P);

        if (this.lastP) {
            const M1 = {
                x: 0.5 * (this.lastP.x + P.x),
                y: 0.5 * (this.lastP.y + P.y),
            };
            const M2 = {
                x: 0.5 * (this.lastM1.x + M1.x),
                y: 0.5 * (this.lastM1.y + M1.y),
            }
            const M3 = {
                x: 0.5 * (this.lastM2.x + M2.x),
                y: 0.5 * (this.lastM2.y + M2.y),
            }
            const M4 = {
                x: 0.5 * (this.lastM3.x + M3.x),
                y: 0.5 * (this.lastM3.y + M3.y),
            }
            const M5 = {
                x: 0.5 * (this.lastM4.x + M4.x),
                y: 0.5 * (this.lastM4.y + M4.y),
            }
            const control1 = {
                x: 0.5 * (this.lastM5.x + this.lastM4.x),
                y: 0.5 * (this.lastM5.y + this.lastM4.y),
            }
            const control2 = {
                x: 0.5 * (M5.x + this.lastM4.x),
                y: 0.5 * (M5.y + this.lastM4.y),
            }
            this.middle += `C${coords(control1)} ${coords(control2)} ${coords(M5)}`;
            this.ending = `C${coords(M4)} ${coords(M2)} ${coords(P)}`;

            // Record current vals for next iteration
            this.lastM1 = M1;
            this.lastM2 = M2;
            this.lastM3 = M3;
            this.lastM4 = M4;
            this.lastM5 = M5;
            this.lastP = P;
        } else {
            this.firstPoint = P;
            this.first = `M${coords(P)}`;
            this.lastM1 = P;
            this.lastM2 = P;
            this.lastM3 = P;
            this.lastM4 = P;
            this.lastM5 = P;
            this.lastP = P;
        }
    }

    addPoint5(P) {
        // 5th degree version - still cubic segments
        this.points.push(P);

        if (this.lastP) {
            const M1 = {
                x: 0.5 * (this.lastP.x + P.x),
                y: 0.5 * (this.lastP.y + P.y),
            };
            const M2 = {
                x: 0.5 * (this.lastM1.x + M1.x),
                y: 0.5 * (this.lastM1.y + M1.y),
            }
            const M3 = {
                x: 0.5 * (this.lastM2.x + M2.x),
                y: 0.5 * (this.lastM2.y + M2.y),
            }
            const M4 = {
                x: 0.5 * (this.lastM3.x + M3.x),
                y: 0.5 * (this.lastM3.y + M3.y),
            }
            const control1 = {
                x: 0.5 * (this.lastM4.x + this.lastM3.x),
                y: 0.5 * (this.lastM4.y + this.lastM3.y),
            }
            const control2 = {
                x: 0.5 * (M4.x + this.lastM3.x),
                y: 0.5 * (M4.y + this.lastM3.y),
            }
            this.middle += `C${coords(control1)} ${coords(control2)} ${coords(M4)}`;
            this.ending = `C${coords(M3)} ${coords(M2)} ${coords(P)}`;

            // Record current vals for next iteration
            this.lastM1 = M1;
            this.lastM2 = M2;
            this.lastM3 = M3;
            this.lastM4 = M4;
            this.lastP = P;
        } else {
            this.firstPoint = P;
            this.first = `M${coords(P)}`;
            this.lastM1 = P;
            this.lastM2 = P;
            this.lastM3 = P;
            this.lastM4 = P;
            this.lastP = P;
        }
    }

    addPoint4(P) {
        // 4th degree version - cubic segments
        this.points.push(P);

        if (this.lastP) {
            const M1 = {
                x: 0.5 * (this.lastP.x + P.x),
                y: 0.5 * (this.lastP.y + P.y),
            };
            const M2 = {
                x: 0.5 * (this.lastM1.x + M1.x),
                y: 0.5 * (this.lastM1.y + M1.y),
            }
            const M3 = {
                x: 0.5 * (this.lastM2.x + M2.x),
                y: 0.5 * (this.lastM2.y + M2.y),
            }
            const control1 = {
                x: 0.5 * (this.lastM3.x + this.lastM2.x),
                y: 0.5 * (this.lastM3.y + this.lastM2.y),
            }
            const control2 = {
                x: 0.5 * (M3.x + this.lastM2.x),
                y: 0.5 * (M3.y + this.lastM2.y),
            }
            this.middle += `C${coords(control1)} ${coords(control2)} ${coords(M3)}`;
            this.ending = `C${coords(M2)} ${coords(M1)} ${coords(P)}`;

            // Record current vals for next iteration
            this.lastM1 = M1;
            this.lastM2 = M2;
            this.lastM3 = M3;
            this.lastP = P;
        } else {
            this.firstPoint = P;
            this.first = `M${coords(P)}`;
            this.lastM1 = P;
            this.lastM2 = P;
            this.lastM3 = P;
            this.lastP = P;
        }
    }

    addPointCubic(P) {
        // Cubic version - quadratic segments
        this.points.push(P);

        if (this.lastP) {
            const control = {
                x: 0.5 * (this.lastP.x + P.x),
                y: 0.5 * (this.lastP.y + P.y)
            };

            if (this.lastQuadControl) {
                this.cubicSmoothPoint = {
                    x: 0.5 * (this.lastQuadControl.x + control.x),
                    y: 0.5 * (this.lastQuadControl.y + control.y)
                };
                this.middle += `Q${coords(this.lastQuadControl)} ${coords(this.cubicSmoothPoint)}`;
            }
            if (this.cubicSmoothPoint) {
                this.ending = `Q${coords(control)} ${coords(P)}`;
            } else {
                this.ending = `L${coords(P)}`;
            }

            this.lastQuadControl = control;
        } else {
            this.firstPoint = P;
            this.first = `M${coords(P)}`;
        }

        this.lastP = P;
    }

    addPointQuad(P) {
        // Quadratic version - linear segments
        this.points.push(P);

        if (this.lastP) {
            const smoothPoint = {
                x: 0.5 * (this.lastP.x + P.x),
                y: 0.5 * (this.lastP.y + P.y)
            };
            this.middle += `L${coords(smoothPoint)}`;
            this.ending = `L${coords(P)}`
        } else {
            this.firstPoint = P;
            this.first = `M${coords(P)}`;
        }

        this.lastP = P;
    }

    addPointOld(P) {

        this.points.push({
            ...P,
            controls: { before: { ...P }, after: { ...P } } 
        });
        this.ending = "";
        const kstart = Math.max(0, this.points.length - smoothing - 1);

        // Skip nesting of for-loops - only compute smoothing when enough data on both sides of point
        this.smoothPoints[kstart] = this.quadSmoothing(kstart);

        for (let k = kstart + 1; k < this.points.length; k++) {
            this.ending += `L${coords(this.points[k])}`;
        }

        this.corrections += `M${coords(this.points[kstart])}L${coords(this.smoothPoints[kstart])}`;
        
        if (kstart > 1) {
            // Compute controls for last point
            const P1 = this.smoothPoints[kstart - 2];
            const P2 = this.smoothPoints[kstart - 1];
            const P3 = this.smoothPoints[kstart];
            // Compute vectors P2 --> P1 and P2 --> P3
            const dx1 = P1.x - P2.x;
            const dy1 = P1.y - P2.y;
            const dx2 = P3.x - P2.x;
            const dy2 = P3.y - P2.y;
            // Compute tangent direction P1 --> P3
            const dx = P3.x - P1.x;
            const dy = P3.y - P1.y;
            const squareNorm = dx * dx + dy * dy;
            // Compute projections and save as controls
            if (squareNorm > 0) {
                const before = catmulRomDist * (dx * dx1 + dy * dy1) / squareNorm;
                P2.controls.before.x += dx * before;
                P2.controls.before.y += dy * before;
                const after = catmulRomDist * (dx * dx2 + dy * dy2) / squareNorm;
                P2.controls.after.x += dx * after;
                P2.controls.after.y += dy * after;
            }
            this.controls += `M${coords(P2.controls.before)}L${coords(P2.controls.after)}`;
            this.middle += `C${coords(P1.controls.after)} ${coords(P2.controls.before)} ${coords(P2)}`;
        } else {
            this.first = `M ${coords(this.points[0])}`;
            this.firstPoint = this.points[0];
        }

        this.lastP = P;

        // Update cumsums for circle reg
        const x2 = P.x * P.x;
        const y2 = P.y * P.y;

        this.Sx  += P.x;
        this.Sxx += x2;
        this.Sy  += P.y;
        this.Syy += y2;
        this.Sxy += P.x * P.y;
        this.Sxw += P.x * (x2 + y2);
        this.Syw += P.y * (x2 + y2);
        this.Sw  += x2 + y2;

        const { Sx, Sxx, Sy, Syy, Sxy, Sxw, Syw, Sw } = this;

        Object.assign(this.points[this.points.length - 1], { Sx, Sxx, Sy, Syy, Sxy, Sxw, Syw, Sw });
    }

    circularSmoothing(k) {
        // <x, dx> = S(xk(xk - xmean)) = S(xk^2) - S(xk * S(xk) / n)
        // Where S(xk * S(xk) / n) = (S(xk))^2 / n
        // Sxx = S(xk^2) and Sx = S(xk)

        const start = Math.max(k - smoothing, 0);
        const end = Math.min(k + smoothing, this.points.length - 1);
        const mean = 1 / (end - start + 1);

        const Pend = this.points[end];

        let
            Sx  = Pend.Sx,
            Sxx = Pend.Sxx,
            Sy  = Pend.Sy,
            Syy = Pend.Syy,
            Sxy = Pend.Sxy,
            Sxw = Pend.Sxw,
            Syw = Pend.Syw,
            Sw  = Pend.Sw;

        if (start > 0) {
            const Pstart = this.points[k - smoothing - 1];
            Sx  -= Pstart.Sx;
            Sxx -= Pstart.Sxx;
            Sy  -= Pstart.Sy;
            Syy -= Pstart.Syy;
            Sxy -= Pstart.Sxy;
            Sxw -= Pstart.Sxw;
            Syw -= Pstart.Syw;
            Sw  -= Pstart.Sw;
        }

        // Compute intermediate values
        const xDx = Sxx - Sx * Sx * mean;
        const yDy = Syy - Sy * Sy * mean;
        const xDy = Sxy - Sx * Sy * mean;
        const xDw = Sxw - Sx * Sw * mean;
        const yDw = Syw - Sy * Sw * mean;

        // Compute system determinant
        const D = xDx * yDy - xDy * xDy;
        let a = NaN, b = NaN;

        if (Math.abs(D) > 1 / 2**20 ) {
            a = 0.5 * (xDw * yDy - yDw * xDy) / D;
            b = 0.5 * (yDw * xDx - xDw * xDy) / D;
        }
        return { D, a, b };
    }

    quadSmoothing(k) {
        let Sx = this.points[k].x;
        let Stx = 0;
        let St2x = 0;
        let Sy = this.points[k].y;
        let Sty = 0;
        let St2y = 0;

        /* Combine x[k + i] and x[k - i] since they should be multiplied by
        *  the same t and t^2
        */
        for (let i = 1; i <= smoothing; i++) {
            const Pi = this.points[clamp(k + i, 0, this.points.length - 1)];
            const Pminusi = this.points[clamp(k - i, 0, this.points.length - 1)];
            const xs = Pi.x + Pminusi.x;
            Sx += xs;
            Stx += i * Pi.x - i * Pminusi.x;
            St2x += t2[i] * xs;
            const ys = Pi.y + Pminusi.y;
            Sy += ys;
            Sty += i * Pi.y - i * Pminusi.y;
            St2y += t2[i] * ys;
        }

        // Compute symmetric quadratic regression for x(t) and y(t)
        const ax = (St2x - S11 * Sx / N) / S22;
        const bx = Stx / St2;
        const cx = (Sx - ax * S11) / N;
        const ay = (St2y - S11 * Sy / N) / S22;
        const by = Sty / St2;
        const cy = (Sy - ay * S11) / N;
        
        const P = { x: cx, y: cy };

        return { ...P, ...{ ax, bx, cx, ay, by, cy }, controls: { before: { ...P }, after: { ...P} } };
    }
}

// Add rounding to coords in order to make it more compact
function coords(P) {
    return P.x.toFixed(3) + "," + P.y.toFixed(3);
}

export function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

function wrap(val, min, max) {
    if (min >= max) return min;
    if (val < min) return wrap(2 * min - val, min, max);
    if (val > max) return wrap(2 * max - val, min, max);
    return val;
}

export function dist(P, Q) {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    return Math.sqrt(dx * dx + dy * dy);
}