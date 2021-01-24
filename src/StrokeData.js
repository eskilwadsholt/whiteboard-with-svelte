function QuadReg(points) {
    /* Sources
    1: https://math.stackexchange.com/questions/267865/equations-for-quadratic-regression
    2: https://www.azdhs.gov/documents/preparedness/state-laboratory/lab-licensure-certification/technical-resources/calibration-training/12-quadratic-least-squares-regression-calib.pdf
    */
    let Sx2y = 0;
    let Sxx = 0;
    let Sxy = 0;
    let Sxx2 = 0;
    let Sx2x2 = 0;
    let Sx3 = 0;
    let Sx2 = 0;
    let Sx = 0;
    let Sy = 0;
    let Sx4 = 0;
    points.forEach(P => {
        Sx += P.x;
        Sx2 += P.x * P.x;
        Sx3 += P.x * P.x * P.x;
        Sx4 += P.x * P.x * P.x * P.x;
        Sxy += P.x * P.y;
        Sy += P.y;
        Sx2y += P.x * P.x * P.y;
    });
    const N = points.length;
    Sxx = Sx2 - Sx * Sx / N;
    Sxx2 = Sx3 - Sx * Sx2 / N;
    Sx2x2 = Sx4 - Sx2 * Sx2 / N;
    Sxy = Sxy - Sx * Sy / N;
    Sx2y = Sx2y - Sx2 * Sy / N;
    const denom = Sxx * Sx2x2 - Sx * Sx2 * Sx * Sx2;
    const a = (Sx2y * Sxx - Sxy * Sxx2) / denom;
    const b = (Sxy * Sx2x2 - Sx2y * Sxx2) / denom;
    const c = Sy / N - b * Sx / N - a * Sx2 / N;
    return { a, b, c };
}

// Number of neighbours to each side of point to make quadreg to smooth
const smoothing = 7;

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
    constructor(ID, color) {
        this.ID = ID;
        this.color = color;
        this.count = 0;
        this.curveLength = 0;
        this.lastPoint = null;
        this.points = [];
        this.smoothPoints = [];
    }
    addPoint(P) {
        if (this.lastPoint != null) {
            this.curveLength += dist(this.lastPoint, P);
        }
        this.points.push({ ...P });
        this.count++;
        for (let k = Math.max(0, this.count - smoothing - 1); k < this.count; k++) {
            this.smoothPoints[k] = this.smoothPoint(k);
        }
        this.lastPoint = P;
    }
    smoothPoint(k) {
        let Sx = 0;
        let St2x = 0;
        let Sy = 0;
        let St2y = 0;
        for (let i = - smoothing; i <= smoothing; i++) {
            const xi = this.points[clamp(k + i, 0, this.count - 1)].x;
            Sx += xi;
            St2x += t2[i] * xi;
            const yi = this.points[clamp(k + i, 0, this.count - 1)].y;
            Sy += yi;
            St2y += t2[i] * yi;
        }
        // Compute symmetric quadratic regression for x(t) and y(t)
        const ax = (St2x - S11 * Sx / N) / S22;
        const cx = (Sx - ax * S11) / N;
        const ay = (St2y - S11 * Sy / N) / S22;
        const cy = (Sy - ay * S11) / N;
        return { x: cx, y : cy};
    }
}

function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

function dist(P, Q) {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    return Math.sqrt(dx * dx + dy * dy);
}