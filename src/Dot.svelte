<script>
    $: stroke = $$props.stroke.points;
    let color = `#FFF`;
    $: if ($$props.stroke.color) {
        color = $$props.stroke.color.code;
    }
    let update = $$props.update;
//<path stroke={color} name={"smoothstroke-quad-" + update} d={path}></path>
</script>

<circle
    name={"dot-" + update}
    cx={stroke[0].x}
    cy={stroke[0].y}
    r=7
    fill={color}
></circle>

<style>
    circle {
        opacity: 0.7;
    }
</style>
