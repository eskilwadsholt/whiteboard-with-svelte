<script>
    import { onMount } from 'svelte';
    import { StrokeData, dist, clamp } from "./StrokeData";
    import Bottombar from "./Bottombar.svelte";
    import Svg from "./Svg.svelte";
    import { line } from './settings';

    const updateFrequency = NaN; // Milliseconds between server requests
    let color;
    let linestyle;
    let mouseData = {};
    let touchData = {};
    // Alternative to observable array
    let update = 0; // When stroke array is updated
    let strokes = [];

    let presenters = { };
    let boardID = new Date();
    let ID = 0;
    let zoomFactor = 1;
    let lastP = null;

    let currentStroke = createNewStroke();
    let leftMouseIsDown = false;
    let rightMouseIsDown = false;
    let touchIsDown = false;
    const maxZoom = 20;
    const minZoom = 0.25;
    let oldZoomFactor = 1;
    let twoFingerDist = 0;
    let twoFingerMidpoint = null;
    let svgTopLeft = { left: 0, top: 0 };
    let latestChangeTimestamp = new Date();
    let changes = 0;

    //$: console.debug(linestyle);

    $: {
        currentStroke.color = $line.color;
        // TODO: refactor so that zoomFactor is applied when drawing instead
        currentStroke.thickness = $line.style ? $line.style.thickness * zoomFactor : 4;
        currentStroke.dash = $line.style ? $line.style.dash * zoomFactor : 0;
    }

    function createNewStroke() {
        lastP = null;
        if ($line.style)
            return new StrokeData(
                ID++, 
                $line.color, 
                $line.style.thickness * zoomFactor, 
                $line.style.dash * zoomFactor);
        return new StrokeData(ID++, $line.color, 4, 0);
    }

    function calibratedFinger(P) {
        return {
            x: P.x - 20,
            y: P.y
        }
    }
    
    function addPoint(P) {
        currentStroke.addPoint(screenToSVG(P));
        if (lastP) currentStroke.addPixelDist(lastP, P);
        lastP = P;
        update++;
    }

    function recordStroke() {
        if (currentStroke.points.length) {
            strokes.push(currentStroke.export());
            currentStroke = createNewStroke();
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
            currentStroke = createNewStroke();
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
            addPoint(calibratedFinger(P));
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
        if (currentStroke.points.length && touchIsDown) recordStroke();
        currentStroke = createNewStroke();
        latestChangeTimestamp = new Date();
        touchIsDown = false;
    }

    function recordLeftMouse(e) {
        const P = { x: e.clientX, y: e.clientY };
        addPoint(P);
    }

    function handleMousedown(e) {
        e.preventDefault();
        mouseData = e;
        leftMouseIsDown = e.button === 0;
        rightMouseIsDown = e.button === 2;
        if (mouseData.button === 0) mouseData.mousedown = true;
        if (leftMouseIsDown) recordLeftMouse(e);
        e.stopPropagation();
    }

    function handleMousemove(e) {
        e.preventDefault();
        mouseData = e;
        if (leftMouseIsDown) recordLeftMouse(e);
        if (rightMouseIsDown) {
            // TODO: movementX and movementY are clunky - use mouseDownPoint as reference instead
            svgTopLeft = {
                left: svgTopLeft.left - e.movementX * zoomFactor,
                top: svgTopLeft.top - e.movementY * zoomFactor
            }
        }
        e.stopPropagation();
    }

    function handleMouseup(e) {
        e.preventDefault();
        leftMouseIsDown = false;
        rightMouseIsDown = false;
        mouseData = {};
        mouseData.mousedown = false;
        if (currentStroke.points.length) recordStroke();
        latestChangeTimestamp = new Date();
    }

    function handleWheel(e) {
        e.preventDefault();
        // TODO: make shared zoom computation for touch and mouse
        const mouseSVGpoint = screenToSVG({ x: e.clientX, y: e.clientY });
        const wheelDelta = e.wheelDelta ? -e.wheelDelta : 50 * e.deltaY;
        zoomFactor = clamp(zoomFactor * Math.pow(2, wheelDelta / 300), minZoom, maxZoom);
        svgTopLeft = { 
            left: mouseSVGpoint.x - e.clientX * zoomFactor, 
            top: mouseSVGpoint.y - e.clientY * zoomFactor 
        };
        latestChangeTimestamp = new Date();
        e.stopPropagation();
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
    //$: console.debug(width + "x" + height);
    $: dims = {
        ...svgTopLeft,
        width: width * zoomFactor,
        height: height * zoomFactor,
        screenWidth: width,
        screenHeight: height,
        zoom: zoomFactor,
    }
    const host = window.location.origin;
    const postEndpoint = '/send-whiteboard/';
    const latestPostedEndpoint = '/check-latest-posted/';
    const updatesEndpoint = '/check-for-updates/';
    const getWhiteBoardEndpoint = host + '/get-whiteboard/';
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
        //console.debug(newTimestamp + "\t" + result);
        checkLatestPosted();
    }

    $: if (updateFrequency) postBoard(latestChangeTimestamp);

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
        //console.debug(latestPosted);
        if (latestPostOnServer < latestPosted) {
            // Make sure to post board again to update to latest
            //console.debug("Post board again ...");
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

        //console.debug(latestUpdates);
        Object.keys(latestUpdates).forEach(presenter => {
            if (!(presenter in presenters)
                ||
                latestUpdates[presenter]['_timestamp'] > presenters[presenter]['_timestamp']) {
                const presenterDetails = { presenter, ...latestUpdates[presenter] };
                getUserWhiteBoard(presenterDetails);
            }
        });

        // Remove presenters that are not currently presenting ...
        const removeThose = [];

        Object.keys(presenters).forEach(presenter => {
            if (!(presenter in latestUpdates)) removeThose.push(presenter);
        });


        removeThose.forEach(presenter => delete presenters[presenter]);

        if (removeThose.length > 0) update++;
    }

    if (updateFrequency) setInterval(checkForUpdates, updateFrequency);

    async function getUserWhiteBoard(userDetails) {
        //console.debug(getWhiteBoardEndpoint);
        const getUserURL = new URL(getWhiteBoardEndpoint);
        getUserURL.search = new URLSearchParams(userDetails);
        //console.debug(getUserURL);

        const res = await fetch(getUserURL, {
            method: 'GET',
            mode: 'cors', // no-cors, *cors, same-origin
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const json = await res.json();
        //console.debug(json);

        if ("strokes" in json) {
            presenters[userDetails.presenter] = { name: userDetails.name,  ...json};
        }
        update++;
    }

    onMount(postBoard);
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
    on:wheel={handleWheel}
>

<Svg {presenters} {strokes} {update} {currentStroke} {dims}></Svg>
<Bottombar 
    bind:selectedColor={color}
    bind:linestyle={linestyle}
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