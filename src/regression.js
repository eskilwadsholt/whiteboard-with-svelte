export function QuadReg(points) {
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

export function LinReg(points) {
    let xMean = 0;
    let yMean = 0;
    points.forEach(P => {
        xMean += P.x;
        yMean += P.y;
    });
    xMean /= points.length;
    yMean /= points.length;
    let numerator = 0;
    let denominator = 0;
    points.forEach(P => {
        numerator += (P.x  - xMean) * (P.y - yMean);
        denominator += Math.pow(P.x  - xMean, 2);
    });
    const a = numerator / denominator;
    const b = yMean - a * xMean;
    return { a, b }
}

export function Intersection(line1, line2) {
    const x = (line2.b - line1.b) / (line1.a - line2.a);
    const y = line1.a * x + line1.b;
    return { x, y }
}