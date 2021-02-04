<script>
    import Dot from "./Dot.svelte";
    import Stroke from "./Stroke.svelte";
    export let dims = { left:0, top:0, width: 0, height: 0 };
    export let presenters = {};
    $: strokes = $$props.strokes;
    $: update = $$props.update;
    $: strokeData = $$props.strokeData;
    const minStroke = 15; // Make at least 15 pixels long strokes
    const outline = 10;
</script>

<svg viewBox={`${dims.left} ${dims.top} ${dims.width} ${dims.height}`}>
    <rect x={-outline} y={-outline} class="outline"
        width={3 * dims.screenWidth + 2 * outline + 1}
        height={3 * dims.screenHeight + 2 * outline + 1}
        stroke-width={2 * outline}></rect>
    <rect width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect x={dims.screenWidth * 2}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect x={dims.screenWidth} y={dims.screenHeight}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect y={dims.screenHeight * 2}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    <rect x={dims.screenWidth * 2} y={dims.screenHeight * 2}
        width={dims.screenWidth} height={dims.screenHeight}></rect>
    {#each Object.keys(presenters) as presenter}
        <rect
            {update}
            class="presenter-viewbox"
            x={presenters[presenter].dims.left}
            y={presenters[presenter].dims.top}
            width={presenters[presenter].dims.width}
            height={presenters[presenter].dims.height}
            stroke-width={dims.zoom}
            stroke-dasharray={10 * dims.zoom}></rect>
        <text
            {update}
            class="presenter-viewbox"
            x={presenters[presenter].dims.left + presenters[presenter].dims.width / 2}
            y={presenters[presenter].dims.top + 2 * dims.zoom}
            style={`font-size:${dims.zoom}em`}>{presenters[presenter].name}</text>
    {/each}
    {#each Object.keys(presenters) as presenter}
        {#each presenters[presenter].strokes as stroke}
            {#if stroke.curveLength > minStroke}
            <Stroke {stroke} {update}></Stroke>
            {:else}
            <Dot {stroke} {update}></Dot>
            {/if}
        {/each}
    {/each}
    {#each strokes as stroke}
        {#if stroke.curveLength > minStroke}
        <Stroke {stroke} {update}></Stroke>
        {:else}
        <Dot {stroke} {update}></Dot>
        {/if}
    {/each}
    {#if strokeData.count}
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
        fill: rgba(0, 0, 0, 0.1);
    }
    rect.outline {
        fill: none;
        stroke: rgba(255, 255, 255, 0.05);
    }
    rect.presenter-viewbox {
        fill: none;
        stroke:rgba(255, 255, 255, 0.3);
    }
    text.presenter-viewbox {
        fill: rgba(255, 255, 255, 0.3);
        text-anchor: middle;
        dominant-baseline: hanging;
    }
</style>