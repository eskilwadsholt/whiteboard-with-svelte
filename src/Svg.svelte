<script>
    import SmoothStroke3 from "./SmoothStroke3.svelte";
    $: strokes = $$props.strokes;
    $: update = $$props.update;
    $: currentStroke = $$props.currentStroke;
</script>

<svg>
    {#each strokes as stroke}
        <SmoothStroke3 {stroke} {update}></SmoothStroke3>
    {/each}
    {#if currentStroke.points.length}
    <SmoothStroke3 stroke={currentStroke} update="current"></SmoothStroke3>
    {/if}
</svg>

<style>
    svg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>