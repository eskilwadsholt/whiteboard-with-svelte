// Number of neighbours to each side of point to make quadreg to smooth
const smoothing = 4;

// Compute constant parts of regression
const t2 = {};
let Stt = 0;
let St4 = 0;
for (let t = - smoothing; t <= smoothing; t++) {
    t2[t] = t * t;
    Stt += t2[t];
    St4 += t2[t] * t2[t];
}
const N = 2 * smoothing + 1;
const S11 = Stt;
const S22 = St4 - Stt * Stt / N;

export class StrokeData {

    constructor(ID, color, thickness, dash) {
        this.ID = ID;
        this.color = color;
        this.thickness = thickness;
        this.dash = dash;
        this.count = 0; // TODO: Check if this always corresponds to points.length
        this.curveLength = 0; // In SVG pixels
        this.pixelDist = 0; // In screen pixels at time of 
        this.firstPoint = null;
        this.lastPoint = null;
        this.points = [];
        this.smoothPoints = [];

        // Store parts of SVG-path
        this.first = "";
        this.middle = "";
        this.ending = "";
    }

    addPixelDist(P, Q) {
        this.pixelDist += dist(P, Q);
    }

    addPoint(P) {
        if (this.lastPoint != null) {
            this.curveLength += dist(this.lastPoint, P);
        }

        this.points.push({ ...P });
        this.count++;
        this.ending = "";
        const kstart = Math.max(0, this.count - smoothing - 1);

        for (let k = kstart; k < this.count; k++) {
            this.smoothPoints[k] = this.smoothPoint(k);
            this.ending += 
            `L ${coords(this.smoothPoints[Math.max(0, k - 1)])},
            ${coords(this.smoothPoints[Math.max(0, k)])}`;
        }

        if (kstart - 1 > 0) {
            this.middle += `L ${coords(this.smoothPoints[Math.max(0, kstart - 2)])},${coords(this.smoothPoints[Math.max(0, kstart - 1)])}`;
        } else {
            this.first = `M ${coords(this.smoothPoints[0])}`;
            this.firstPoint = this.smoothPoints[0];
        }

        this.lastPoint = P;
    }

    smoothPoint(k) {
        let Sx = this.points[k].x;
        let St2x = 0;
        let Sy = this.points[k].y;
        let St2y = 0;

        /* Combine x[k + i] and x[k - i] since they should be multiplied by
        *  the same t and t^2
        */
        for (let i = 1; i <= smoothing; i++) {
            const Pi = this.points[clamp(k + i, 0, this.count - 1)];
            const Pminusi = this.points[clamp(k - i, 0, this.count - 1)];
            const xs = Pi.x + Pminusi.x;
            Sx += xs;
            St2x += t2[i] * xs;
            const ys = Pi.y + Pminusi.y;
            Sy += ys;
            St2y += t2[i] * ys;
        }

        // Compute symmetric quadratic regression for x(t) and y(t)
        const ax = (St2x - S11 * Sx / N) / S22;
        const cx = (Sx - ax * S11) / N;
        const ay = (St2y - S11 * Sy / N) / S22;
        const cy = (Sy - ay * S11) / N;
        
        return { x: cx, y : cy};
    }
}

function coords(P) {
    return P.x + "," + P.y;
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