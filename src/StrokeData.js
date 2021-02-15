// Number of neighbours to each side of point to make quadreg to smooth
const smoothing = 3;
const catmulRomDist = 1 / 3;

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
        this.pixelDist = 0; // In screen pixels at time of 
        this.firstPoint = null;
        this.lastPoint = null;
        this.cubicSmoothPoint = null; // Middle of middles (cubic Bezier)
        this.lastQuadControl = null;
        this.points = [];
        this.quadControls = [];
        this.smoothPoints = [];

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
    }

    export() {
        //const { pixelDist, thickness, dash, color, firstPoint, first, middle, ending} = this;
        //return { pixelDist, thickness, dash, color, firstPoint, first, middle, ending};
        return this;
    }

    addPixelDist(P, Q) {
        this.pixelDist += dist(P, Q);
    }

    addPoint(P) {
        // 4th degree version - cubic segments
        this.points.push(P);

        if (this.lastPoint) {
            const control = {
                x: 0.5 * (this.lastPoint.x + P.x),
                y: 0.5 * (this.lastPoint.y + P.y)
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

        this.lastPoint = P;
    }

    addPointCubic(P) {
        // Cubic version - quadratic segments
        this.points.push(P);

        if (this.lastPoint) {
            const control = {
                x: 0.5 * (this.lastPoint.x + P.x),
                y: 0.5 * (this.lastPoint.y + P.y)
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

        this.lastPoint = P;
    }

    addPointQuad(P) {
        // Quadratic version - linear segments
        this.points.push(P);

        if (this.lastPoint) {
            const smoothPoint = {
                x: 0.5 * (this.lastPoint.x + P.x),
                y: 0.5 * (this.lastPoint.y + P.y)
            };
            this.middle += `L${coords(smoothPoint)}`;
            this.ending = `L${coords(P)}`
        } else {
            this.firstPoint = P;
            this.first = `M${coords(P)}`;
        }

        this.lastPoint = P;
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

        this.lastPoint = P;

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
        const bx = Stx / Stt;
        const cx = (Sx - ax * S11) / N;
        const ay = (St2y - S11 * Sy / N) / S22;
        const by = Sty / Stt;
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

export function dist(P, Q) {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    return Math.sqrt(dx * dx + dy * dy);
}