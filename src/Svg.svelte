<script>
    import Dot from "./Dot.svelte";
    import Stroke from "./Stroke.svelte";
    
    export let dims = { left:0, top:0, width: 0, height: 0 };
    export let presenters = {};
    export let strokes;
    export let current;
    
    const minStroke = 8; // Make at least 8 pixels long strokes
    const outline = 10; // Thickness of border around shaded regions

    const regions = [];
    const patternWidth = 800;
    const patternHeight = 600;
    const patternReps = 4;
    const majorPattern = 2;

    let i = 0;
    let shades = [ "#0002", "#0004" ];

    for (let left = 0; left < patternReps; left++) {
        for (let top = 0; top < patternReps; top++) {
            i = (left + top) % shades.length;
            const shade = shades[i];
            regions.push({
                left: left * patternWidth,
                top: top * patternHeight,
                width: patternWidth,
                height: patternHeight,
                shade: shade
            });
        }
    }

    shades = [ "#0000", "#0004" ];

    for (let left = 0; left < patternReps / majorPattern; left++) {
        for (let top = 0; top < patternReps / majorPattern; top++) {
            i = (left + top) % shades.length;
            const shade = shades[i];
            regions.push({
                left: left * patternWidth * majorPattern,
                top: top * patternHeight * majorPattern,
                width: patternWidth * majorPattern,
                height: patternHeight * majorPattern,
                shade: shade
            });
        }
    }

</script>

<svg viewBox={`${dims.left} ${dims.top} ${dims.width} ${dims.height}`}>
    <rect x={-outline} y={-outline} class="outline"
        width={patternReps * patternWidth + 2 * outline}
        height={patternReps * patternHeight + 2 * outline}
        stroke-width={2 * outline}></rect>
    {#each regions as region}
        <rect
            x={region.left}
            y={region.top}
            width={region.width}
            height={region.height}
            fill={region.shade}
        ></rect>
    {/each}
    {#each Object.keys(presenters) as presenter}
        <rect
            class="presenter-viewbox"
            x={presenters[presenter].dims.left}
            y={presenters[presenter].dims.top}
            width={presenters[presenter].dims.width}
            height={presenters[presenter].dims.height}
            stroke-width={dims.zoom}
            stroke-dasharray={10 * dims.zoom}></rect>
        <text
            class="presenter-viewbox"
            x={presenters[presenter].dims.left + presenters[presenter].dims.width / 2}
            y={presenters[presenter].dims.top + 2 * dims.zoom}
            style={`font-size:${dims.zoom}em`}>{presenters[presenter].name}</text>
    {/each}
    {#each Object.keys(presenters) as presenter}
        {#each presenters[presenter].strokes as stroke}
            {#if stroke.pixelDist > minStroke}
            <Stroke animation={{ speed: 1 }} {stroke}></Stroke>
            {:else}
            <Dot {stroke}></Dot>
            {/if}
        {/each}
    {/each}
    {#each strokes as stroke}
        {#if stroke.pixelDist > minStroke}
        <Stroke {stroke}></Stroke>
        {:else}
        <Dot {stroke}></Dot>
        {/if}
    {/each}
    {#if current.points.length}
    <Stroke stroke={current}></Stroke>
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