<script>
    export let stroke;
    let color = `#FFF`;
    let thickness = 4;
    let dash = 0;
    export let update;

    $: path = stroke.first + stroke.middle + stroke.ending;;
    
    $: if (stroke) {
        color = stroke.color.code;
        thickness = stroke.thickness;
        dash = stroke.dash;
    }

    let P = null;
    let cubicRegPath = null;

    function mouseoverPointText(i) {
        plotCubicReg(i);
    }

    const smoothing = 3;

    function plotCubicReg(i) {
        P = stroke.smoothPoints[i];
        const { ax, bx, cx, dx, ay, by, cy, dy } = P;
        cubicRegPath = "";
        for (let t = -smoothing; t <= smoothing; t += 0.1) {
            const x = ax * t**3 + bx * t**2 + cx * t + dx;
            const y = ay * t**3 + by * t**2 + cy * t + dy;
            cubicRegPath += (t === -smoothing ? "M" : "L") + `${x} ${y}`;
        }
    }
    
</script>

<path
    stroke={color}
    stroke-width={thickness}
    stroke-dasharray={dash}
    name={"stroke-" + update}
    d={path}>
</path>

<style>
    path {
        fill: none;
        opacity: 0.7;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>