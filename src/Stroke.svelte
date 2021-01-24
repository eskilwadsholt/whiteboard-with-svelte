<script>
    $: stroke = $$props.stroke.smoothPoints;
    let color = `#FFF`;
    $: if ($$props.stroke.color) {
        color = $$props.stroke.color.code;
    }
    let update = $$props.update;
    let path = "";
    $: if (stroke.length) {
        path = `M ${stroke[0].x},${stroke[0].y}\n`;
        for (let i = 1; i < stroke.length - 1; i++) {
            path += `L ${stroke[i].x},${stroke[i].y}\n`;
        }
    }
</script>

<path stroke={color} name={"stroke-" + update} d={path}></path>

<style>
    path {
        fill: none;
        opacity: 0.7;
        stroke-width: 5px;
    }
</style>