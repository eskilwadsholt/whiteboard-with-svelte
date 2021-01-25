<script>
    import Dot from "./Dot.svelte";
    import Stroke from "./Stroke.svelte";
    export let dims = { left:0, top:0, width: 0, height: 0 };
    $: strokes = $$props.strokes;
    $: update = $$props.update;
    // $: currentStroke = $$props.currentStroke;
    $: strokeData = $$props.strokeData;
    const minStroke = 15; // Make at least 15 pixels long strokes
</script>

<svg viewBox={`${dims.left} ${dims.top} ${dims.width} ${dims.height}`}>
    <rect width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect x={dims.screenWidth * 2}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect x={dims.screenWidth} y={dims.screenHeight}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect y={dims.screenHeight * 2}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect x={dims.screenWidth * 2} y={dims.screenHeight * 2}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
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
    rect {
        fill: rgb(30, 30, 30);
    }
</style>