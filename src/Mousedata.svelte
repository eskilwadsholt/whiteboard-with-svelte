<script>
    $: data = $$props.mouseData;
    let P = { x: " ", y: " " };
    $: if (data.clientX) P = { x: data.clientX, y: data.clientY };
    let mousedown = false;
    $: if ("mousedown" in data) mousedown = data.mousedown;
</script>

<div class="mousedata">
    <div>
        Mousepos: ({P.x},{P.y})
    </div>
    <div>
        Mousedown: {mousedown}
    </div>
</div>