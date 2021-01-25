<script>
    import { StrokeData } from "./StrokeData";
    import Bottombar from "./Bottombar.svelte";
    import Mousedata from "./Mousedata.svelte";
    import Svg from "./Svg.svelte";
    import Touchdata from "./Touchdata.svelte";
    let color = { name: "white", code: "#FFF" };
    const debugging = true;
    const debugUpDown = false;
    const debugMove = false;
    let mouseData = {};
    let touchData = {};
    let update = 0;
    let strokes = [];
    let ID = 0;
    $: { 
        strokeData.color = color 
    }
    let strokeData = new StrokeData(ID++, color);
    let mouseIsDown = false;
    let touchIsDown = false;
    function dist(P, Q) {
        const dx = Q.x - P.x;
        const dy = Q.y - P.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    function addPoint(P) {
        strokeData.addPoint(P);
        update++;
    }
    function recordStroke() {
        strokes.push(strokeData);
        strokeData = new StrokeData(ID++, color);
        update++;
    }
    // Detect mouse and touch events
    function handleTouchStart(e) {
        e.preventDefault();
        touchData = e;
        if (debugUpDown) {
            Object.entries(e.touches).forEach(entry => {
                const [i, touch] = entry;
                console.log(`touchstart ${i}:\t${JSON.stringify(eventPoint(touch))}`);
            });
        }
        if (e.touches.length > 1) { 
            strokes.pop();
            touchIsDown = false;
            currentStroke = [];
            update++;
        }
        else {
            touchIsDown = true;
            recordTouch(e);
        }
    }
    function recordTouch(e) {
        if (Object.keys(e.touches).length === 1) {
            const touch = e.touches[0];
            const P = { x: touch.clientX, y: touch.clientY };
            addPoint(P);
        }
    }
    function handleTouchmove(e) {
        e.preventDefault();
        touchData = e;
        if (debugMove) {
            Object.entries(e.touches).forEach(entry => {
                const [i, touch] = entry;
                console.log(`touchmove ${i}:\t${JSON.stringify(eventPoint(touch))}`);
            });
        }
        recordTouch(e);
    }
    function handleTouchend(e) {
        e.preventDefault();
        touchData = {};
        if (debugUpDown) {
            console.log(`touchend:\t${JSON.stringify(e)}`)
        }
        // if (currentStroke && touchIsDown) recordStroke();
        if (strokeData.count && touchIsDown) recordStroke();
        touchIsDown = false;
    }
    function recordMouse(e) {
        const P = { x: e.clientX, y: e.clientY };
        addPoint(P);
    }
    function handleMousedown(e) {
        e.preventDefault();
        mouseData = e;
        mouseIsDown = e.button === 0;
        if (mouseData.button === 0) mouseData.mousedown = true;
        if (debugUpDown)
            console.log(`mousedown:\t${JSON.stringify(eventPoint(e))}`);
        if (mouseIsDown) recordMouse(e);
    }
    function handleMousemove(e) {
        e.preventDefault();
        mouseData = e;
        if (debugMove)
            console.log(`mousemove:\t${JSON.stringify(eventPoint(e))}`);
        if (mouseIsDown) recordMouse(e);
    }
    function handleMouseup(e) {
        e.preventDefault();
        mouseIsDown = false;
        mouseData = {};
        mouseData.mousedown = false;
        if (debugUpDown) {
            console.log(`mouseup:\t${JSON.stringify(e)}`)
        }
        // if (currentStroke) recordStroke();
        if (strokeData.count) recordStroke();
    }
    function eventPoint(e) { return { x: e.clientX, y: e.clientY }; }
    function handleClear() {
        strokes = [];
        update = 0;
    }
</script>

<div class="whiteboard"
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchmove}
    on:touchend={handleTouchend}
    on:mousedown={handleMousedown}
    on:mousemove={handleMousemove}
    on:mouseup={handleMouseup}
>
{#if debugging}
    {#if mouseIsDown}
    <Mousedata {mouseData}></Mousedata>
    {/if}
    <Touchdata {touchData}></Touchdata>
{/if}
<Svg {strokes} {update} {strokeData}></Svg>
<Bottombar bind:selectedColor={color} on:clear={handleClear}/>
</div>

<style>
    .whiteboard {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>