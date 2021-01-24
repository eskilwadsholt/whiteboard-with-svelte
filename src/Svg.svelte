<script>
    import Dot from "./Dot.svelte";
    import SmoothStroke3 from "./SmoothStroke3.svelte";
    import Stroke from "./Stroke.svelte";
    $: strokes = $$props.strokes;
    $: update = $$props.update;
    // $: currentStroke = $$props.currentStroke;
    $: strokeData = $$props.strokeData;
    const minStroke = 15; // Make at least 15 pixels long strokes
</script>

<svg>
    {#each strokes as stroke}
        {#if stroke.curveLength > minStroke}
        <!--SmoothStroke3 {stroke} {update}></SmoothStroke3-->
        <Stroke {stroke} {update}></Stroke>
        {:else}
        <Dot {stroke} {update}></Dot>
        {/if}
    {/each}
    {#if strokeData.count}
    <!--SmoothStroke3 stroke={strokeData.smoothPoints} update="current"></SmoothStroke3-->
    <Stroke stroke={strokeData} update="current"></Stroke>
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