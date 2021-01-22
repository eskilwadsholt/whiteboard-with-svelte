<script>
    import { each } from "svelte/internal";
    $: stroke = $$props.stroke;
    let update = $$props.update;
</script>

<g name={"stroke" + update}>
    {#each stroke as point}
        <circle
            cx={point.x}
            cy={point.y}
            r=3
        />
    {/each}
</g>

<style>
    circle {
        fill: rgba(255, 255, 255, 0.3);
    }
</style>