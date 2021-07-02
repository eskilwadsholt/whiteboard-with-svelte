// Number of neighbours to each side of point to make cubicreg to smooth
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
        this.points = [];
        this.smoothPoints = [];
        this.lastScreenP = null;

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
        this.endingCorrections = "";
    }

    export() {
        const { totalTime, processTime } = this;
        const ratio = totalTime / processTime;
        console.debug({ totalTime, processTime, ratio });
        return this;
    }

    addPixelDistTo(screenP) {
        if (this.lastScreenP) this.pixelDist += dist(this.lastScreenP, screenP);
        this.lastScreenP = screenP;
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
            const P = this.points[clamp(k + t, 0, this.points.length - 1)];
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
            controls: { before: { ...P }, after: { ...P} },
        };
    }

    cubicSmoothEnding() {
        this.ending = "";
        this.endingCorrections = "";

        const kstart = Math.max(0, this.points.length - smoothing - 1);

        // Get cubic regs for last smooth point
        const { ax, bx, cx, dx, ay, by, cy, dy } = this.smoothPoints[kstart];

        for (let k = kstart + 1; k < this.points.length; k++) {
            const t = k - kstart;
            this.smoothPoints[k] = {
                x: ax * t**3 + bx * t**2 + cx * t + dx,
                y: ay * t**3 + by * t**2 + cy * t + dy,
            }
            this.smoothPoints[k].controls = {
                before: { },
                after: { },
            }
            this.endingCorrections += `M${coords(this.points[k])}L${coords(this.smoothPoints[k])}`;

            if (k > 1) {
                const P = this.smoothPoints[k];

                let dxdt = 3 * ax * t**2 + 2 * bx * t + cx;
                let dydt = 3 * ay * t**2 + 2 * by * t + cy;

                dxdt = catmulRomDist * dxdt;
                dydt = catmulRomDist * dydt;

                P.controls = {
                    before: { x: P.x - dxdt, y: P.y - dydt },
                    after: { x: P.x + dxdt, y: P.y + dydt },
                }

                this.ending += `S${coords(P.controls.before)} ${coords(P)}`;
            }
        }
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
            controls: { before: { ...newP }, after: { ...newP } },
        });
        
        const kstart = Math.max(0, this.points.length - smoothing - 1);

        // Skip nesting of for-loops - only compute smoothing when enough data on both sides of point
        this.smoothPoints[kstart] = this.cubicReg(kstart);

        this.cubicSmoothEnding();

        this.corrections += `M${coords(this.points[kstart])}L${coords(this.smoothPoints[kstart])}`;
        
        if (kstart > 1) {
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

export function dist(P, Q) {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    return Math.sqrt(dx * dx + dy * dy);
}