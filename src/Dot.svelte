<script>
    $: point = $$props.stroke.firstPoint;
    $: thickness = $$props.stroke.thickness;
    let color = `#FFF`;
    $: if ($$props.stroke.color) {
        color = $$props.stroke.color.code;
    }
    let update = $$props.update;
</script>

<circle
    name={"dot-" + update}
    cx={point.x}
    cy={point.y}
    r={thickness}
    fill={color}
></circle>

<style>
    circle {
        opacity: 0.7;
    }
</style>
