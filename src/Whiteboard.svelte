<script>
    import { StrokeData, dist, clamp } from "./StrokeData";
    import Bottombar from "./Bottombar.svelte";
    import Mousedata from "./Mousedata.svelte";
    import Svg from "./Svg.svelte";
    import Touchdata from "./Touchdata.svelte";
    let color = { name: "white", code: "#FFF" };
    const debugging = false;
    let mouseData = {};
    let touchData = {};
    let update = 0;
    let strokes = [];
    let ID = 0;
    $: { 
        strokeData.color = color;
    }
    let strokeData = new StrokeData(ID++, color);
    let mouseIsDown = false;
    let touchIsDown = false;
    const maxZoom = 2;
    const minZoom = 0.5;
    let zoomFactor = 1;
    let oldZoomFactor = 1;
    let twoFingerDist = 0;
    let twoFingerMidpoint = null;
    let svgTopLeft = { left: 0, top: 0 };
    function addPoint(P) {
        strokeData.addPoint(screenToSVG(P));
        update++;
    }
    function recordStroke() {
        if (strokeData.count) {
            strokes.push(strokeData);
            strokeData = new StrokeData(ID++, color);
            update++;
        }
    }
    // Detect mouse and touch events
    function handleTouchStart(e) {
        e.preventDefault();
        touchData = e;
        if (e.touches.length === 1) {
            touchIsDown = true;
            recordTouch(e);
        } else if (e.touches.length === 2) {
            touchIsDown = false;
            const touch = e.touches[0];
            const P = { x: touch.clientX, y: touch.clientY };
            const touch2 = e.touches[1];
            const Q = { x: touch2.clientX, y: touch2.clientY };
            twoFingerDist = dist(P, Q);
            twoFingerMidpoint = screenToSVG({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });
            oldZoomFactor = zoomFactor;
        }
    }
    function recordTouch(e) {
        if (touchIsDown) {
            const touch = e.touches[0];
            const P = { x: touch.clientX, y: touch.clientY };
            addPoint(P);
        }
        else if (e.touches.length === 2) {
            const touch = e.touches[0];
            const P = { x: touch.clientX, y: touch.clientY };
            const touch2 = e.touches[1];
            const Q = { x: touch2.clientX, y: touch2.clientY };
            const newTwoFingerDist = dist(P, Q);
            const newMidpoint = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
            svgTopLeft = {
                left: twoFingerMidpoint.x - newMidpoint.x * zoomFactor,
                top: twoFingerMidpoint.y - newMidpoint.y * zoomFactor,
            }
            zoomFactor = clamp(oldZoomFactor * twoFingerDist / newTwoFingerDist, minZoom, maxZoom);
        }
    }
    function handleTouchmove(e) {
        e.preventDefault();
        touchData = e;
        recordTouch(e);
    }
    function handleTouchend(e) {
        e.preventDefault();
        touchData = {};
        if (strokeData.count && touchIsDown) recordStroke();
        strokeData = new StrokeData(ID++, color);
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
        if (mouseIsDown) recordMouse(e);
    }
    function handleMousemove(e) {
        e.preventDefault();
        mouseData = e;
        if (mouseIsDown) recordMouse(e);
    }
    function handleMouseup(e) {
        e.preventDefault();
        mouseIsDown = false;
        mouseData = {};
        mouseData.mousedown = false;
        // if (currentStroke) recordStroke();
        if (strokeData.count) recordStroke();
    }
    function handleClear() {
        strokes = [];
        update = 0;
        zoomFactor = 1;
        svgTopLeft = { left: 0, top: 0 };
    }
    function handleUndo() {
        strokes.pop();
        update++;
    }
    function screenToSVG(P) {
        return {
            x: dims.left + P.x / width * dims.width,
            y: dims.top + P.y / height * dims.height,
        }
    }
    let width = 0, height = 0;
    $: console.log(width + "x" + height);
    $: dims = {
        ...svgTopLeft,
        width: width * zoomFactor,
        height: height * zoomFactor,
        screenWidth: width,
        screenHeight: height,
    }
</script>

<div class="whiteboard"
    bind:clientWidth={width}
    bind:clientHeight={height}
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
<Svg {strokes} {update} {strokeData} {dims}></Svg>
<Bottombar bind:selectedColor={color} on:clear={handleClear} on:undo={handleUndo}/>
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