<script>
    import { LinReg, Intersection } from "./regression.js";
    import { each } from "svelte/internal";

    $: stroke = $$props.stroke;
    let smoothStroke = [];
    let update = $$props.update;
    const smoothSize = 2;
    $: {
        stroke.forEach((element, i) => {
            if (i >= smoothSize && i < stroke.length - smoothSize) {
                let x = 0;
                let y = 0;
                stroke.slice(i - smoothSize, i + smoothSize + 1).forEach(P => {
                    x += P.x;
                    y += P.y;
                });
                x /= 2 * smoothSize + 1;
                y /= 2 * smoothSize + 1;
                smoothStroke.push({ x, y });
            }
        });
    }
</script>

<g name={"smoothstroke-" + update}>
    {#each smoothStroke as point}
        <circle
            cx={point.x}
            cy={point.y}
            r=3
        />
    {/each}
</g>

<style>
    circle {
        fill: rgba(0, 0, 255, 0.5);
    }
</style>