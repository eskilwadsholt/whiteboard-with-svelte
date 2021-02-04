<script>
    import { StrokeData, dist, clamp } from "./StrokeData";
    import Bottombar from "./Bottombar.svelte";
    import Mousedata from "./Mousedata.svelte";
    import Svg from "./Svg.svelte";
    import Touchdata from "./Touchdata.svelte";
    let color;
    let thickness;
    const debugging = false;
    let mouseData = {};
    let touchData = {};
    let update = 0;
    let presenters = { };
    let strokes = [];
    let boardID = new Date();
    let ID = 0;
    let zoomFactor = 1;
    $: { 
        strokeData.color = color;
        strokeData.thickness = thickness * zoomFactor;
    }
    function createNewStroke() { return new StrokeData(ID++, color, thickness * zoomFactor); }
    let strokeData = createNewStroke();
    let mouseIsDown = false;
    let touchIsDown = false;
    const maxZoom = 20;
    const minZoom = 0.5;
    let oldZoomFactor = 1;
    let twoFingerDist = 0;
    let twoFingerMidpoint = null;
    let svgTopLeft = { left: 0, top: 0 };
    let latestChangeTimestamp = new Date();
    let changes = 0;
    function addPoint(P) {
        strokeData.addPoint(screenToSVG(P));
        update++;
    }
    function recordStroke() {
        if (strokeData.count) {
            const { curveLength, thickness, color, firstPoint, first, middle, ending } = strokeData;
            strokes.push({ curveLength, thickness, color, firstPoint, first, middle, ending });
            strokeData = createNewStroke();
            update++;
            latestChangeTimestamp = new Date();
            changes++;
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
            strokeData = createNewStroke();
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
        strokeData = createNewStroke();
        latestChangeTimestamp = new Date();
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
        if (strokeData.count) recordStroke();
    }
    function handleClear() {
        strokes = [];
        update++;
        boardID = new Date();
        latestChangeTimestamp = new Date();
        changes++;
    }
    function handleUndo() {
        strokes.pop();
        update++;
        latestChangeTimestamp = new Date();
        changes++;
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
        zoom: zoomFactor,
    }
    //const host = 'http://localhost:5000';
    const fullHost = 'https://sharepad-api.herokuapp.com';
    const host = '';
    const latestPostedEndpoint = host + '/check-latest-posted/';
    const updatesEndpoint = host + '/check-for-updates/';
    const getWhiteBoardEndpoint = fullHost + '/get-whiteboard/';
    const postEndpoint = host + '/send-whiteboard/';
    let latestPosted = 0;
    async function postBoard() {
        const newTimestamp = latestChangeTimestamp.getTime() + changes * 0.0001;
        if (newTimestamp > latestPosted) latestPosted = newTimestamp;
        const res = await fetch(postEndpoint, {
            method: 'POST',
            mode: 'cors', // no-cors, *cors, same-origin
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                _id: boardID,
                _timestamp: newTimestamp,
                strokes,
                dims,
            }),
        });
        
        const json = await res.json();
        const result = JSON.stringify(json);
        console.log(newTimestamp + "\t" + result);
        checkLatestPosted();
    }
    $: postBoard(latestChangeTimestamp);
    let latestPostOnServer = 0;
    async function checkLatestPosted() {
        const res = await fetch(latestPostedEndpoint, {
            method: 'GET',
            mode: 'cors', // no-cors, *cors, same-origin
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const json = await res.json();
        latestPostOnServer = json._timestamp;
        console.log(latestPosted);
        if (latestPostOnServer < latestPosted) {
            // Make sure to post board again to update to latest
            console.log("Post board again ...");
            postBoard();
        }
    }
    let latestUpdates = {};
    async function checkForUpdates() {
        const res = await fetch(updatesEndpoint, {
            method: 'GET',
            mode: 'cors', // no-cors, *cors, same-origin
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const json = await res.json();
        latestUpdates = json;
        console.log(latestUpdates);
        Object.keys(latestUpdates).forEach(presenter => {
            if (!(presenter in presenters)
                ||
                latestUpdates[presenter]['_timestamp'] > presenters[presenter]['_timestamp']) {
                const presenterDetails = { presenter, ...latestUpdates[presenter] };
                getUserWhiteBoard(presenterDetails);
            }
        });
        // Remove presenter that are not currently presenting ...
        const removeThose = [];
        Object.keys(presenters).forEach(presenter => {
            if (!(presenter in latestUpdates)) removeThose.push(presenter);
        });
        removeThose.forEach(presenter => delete presenters[presenter]);
    }
    setInterval(checkForUpdates, 1000);
    async function getUserWhiteBoard(userDetails) {
        const getUserURL = new URL(getWhiteBoardEndpoint);
        getUserURL.search = new URLSearchParams(userDetails);
        const res = await fetch(getUserURL, {
            method: 'GET',
            mode: 'cors', // no-cors, *cors, same-origin
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const json = await res.json();
        console.log(json);
        if ("strokes" in json) {
            presenters[userDetails.presenter] = { name: userDetails.name,  ...json};
            update++;
        }
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
<Svg {presenters} {strokes} {update} {strokeData} {dims}></Svg>
<Bottombar 
    bind:selectedColor={color}
    bind:thickness={thickness}
    on:clear={handleClear}
    on:undo={handleUndo}/>
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