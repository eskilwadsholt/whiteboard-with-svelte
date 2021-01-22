<script>
    import { LinReg, Intersection } from "./regression.js";
    import { each } from "svelte/internal";

    $: stroke = $$props.stroke;
    let smoothStroke = [];
    let update = $$props.update;
    const smoothSize = 3;
    const xPoints = [];
    const yPoints = [];
    $: {
        stroke.forEach((element, i) => {
            if (i >= smoothSize && i < stroke.length - smoothSize) {
                stroke.slice(i - smoothSize, i + smoothSize + 1).forEach((P, di) => {
                    xPoints[di] = { x: -smoothSize + di, y: P.x };
                    yPoints[di] = { x: -smoothSize + di, y: P.y };
                });
                const x = LinReg(xPoints).b;
                const y = LinReg(yPoints).b;
                smoothStroke.push({ x, y });
            }
        });
    }
</script>

<g name={"smoothstroke-linear-" + update}>
    {#each smoothStroke as point}
        <circle
            cx={point.x}
            cy={point.y}
            r=2
        />
    {/each}
</g>

<style>
    circle {
        fill: rgba(0, 255, 0, 0.5);
    }
</style>