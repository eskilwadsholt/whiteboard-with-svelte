<script>
    import { draw } from 'svelte/transition';
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
    
    export let animation = { duration: 0 };

    let P = null;
    let circleReg = null;
    let quadReg = null;

    function mouseoverPointText(i) {
        quadRegText(i);
    }

    function quadRegText(i) {
        P = stroke.smoothPoints[i];
        const { ax, bx, cx, ay, by, cy } = P;
        quadReg = "";
        for (let t = -10; t <= 10; t += 0.1) {
            const x = ax * t**2 + bx * t + cx;
            const y = ay * t**2 + by * t + cy;
            quadReg += (t === - 10 ? "M" : "L") + `${x} ${y}`;
        }
    }

    function circleRegText(i) {
        P = stroke.points[i];
        circleReg = stroke.circularSmoothing(i);
        const dx = P.x - circleReg.a;
        const dy = P.y - circleReg.b;
        circleReg.r = Math.sqrt(dx * dx + dy * dy);
    }

</script>

<path
    in:draw={animation}
    stroke={color}
    stroke-width={thickness}
    stroke-dasharray={dash}
    name={"stroke-" + update}
    d={path}>
</path>
{#each stroke.points as P}
    <circle
        cx={P.x}
        cy={P.y}
        r={0.2 * thickness}
        fill="#000"
    ></circle>    
{/each}
<!--->
<path
    d={stroke.controls}
    stroke="#000"
    stroke-width={0.2 * thickness}
></path>
<path
    d={stroke.corrections}
    stroke="#F00"
    stroke-width={0.2 * thickness}
></path>
<!--->
{#if P}
    <text x={P.x} y={P.y}
        font-size={2 * thickness + "px"}>
        {`(${(circleReg.a - P.x).toFixed(1)},${(circleReg.b - P.y).toFixed(1)})`}
    </text>
    <circle
        cx={circleReg.a}
        cy={circleReg.b}
        r={circleReg.r}
        fill="none"
        stroke="#F00"
        stroke-width={0.3 * thickness}
    >
    </circle>
    <circle
        cx={P.x}
        cy={P.y}
        r={0.5 * thickness}
        fill="#F00"
        >
    </circle>
{/if}
<!--->
{#if P}
    <text x={P.x} y={P.y}
        font-size={2 * thickness + "px"}
        pointer-evnets="none"
    >
        {`(${P.x.toFixed(1)},${P.y.toFixed(1)})`}
    </text>
    <circle
        cx={P.x}
        cy={P.y}
        r={0.5 * thickness}
        fill="#00F"
        >
    </circle>
    <path
        stroke="#00F"
        stroke-width={0.3 * thickness}
        d={quadReg}
    ></path>
{/if}
<!---->


<style>
    path {
        fill: none;
        opacity: 0.7;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>