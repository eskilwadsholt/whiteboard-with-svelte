<script>
    import { QuadReg } from "./regression.js";
    import { each } from "svelte/internal";

    $: stroke = $$props.stroke.points;
    let color = `#FFF`;
    $: if ($$props.stroke.color) {
        color = $$props.stroke.color.code;
    }
    let smoothStroke = [];
    let update = $$props.update;
    const smoothSize = 7;
    const xPoints = [];
    const yPoints = [];
    let path = "";
    let errors = "";
    function clamp(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }
    $: {
        if (stroke.length) {

            let smoothStroke = [];
            for (let i = 0; i < stroke.length; i++) {
                for (let di = -smoothSize; di <= smoothSize; di++) {
                    const P = stroke[clamp(i + di, 0, stroke.length - 1)];
                    xPoints[di + smoothSize] = { x: di, y: P.x };
                    yPoints[di + smoothSize] = { x: di, y: P.y };
                }
                const P = stroke[i];
                const x = QuadReg(xPoints).c;
                const y = QuadReg(yPoints).c;
                smoothStroke.push({ x, y, ox: P.x, oy: P.y });
    
            }
            path = `M ${smoothStroke[0].x},${smoothStroke[0].y}`;
            errors = `M ${smoothStroke[0].x},${smoothStroke[0].y}
L ${smoothStroke[0].ox},${smoothStroke[0].oy}`;
            for (let i = 1; i < smoothStroke.length - 1; i++) {
                //path.push({ P: smoothStroke[i], Q: smoothStroke[i + 1] });
                path += `L ${smoothStroke[i].x},${smoothStroke[i].y}`;
                errors += `M ${smoothStroke[i].x},${smoothStroke[i].y}
L ${smoothStroke[i].ox},${smoothStroke[i].oy}`;
            }
        }
    }
    
</script>

<path stroke={color} name={"smoothstroke-quad-" + update} d={path}></path>

<style>
    /*circle {
        fill: black;
    }*/
    path {
        fill: none;
        opacity: 0.7;
        stroke-width: 5px;
    }
</style>