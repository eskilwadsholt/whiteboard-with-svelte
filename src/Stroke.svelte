<script>
    //$: stroke = $$props.stroke.smoothPoints;
    export let stroke;
    $: cubicPath = stroke.first + stroke.cubicMiddle + stroke.ending;
    let color = `#FFF`;
    let thickness = 4;
    let dash = 0;
    $: if (stroke) {
        color = stroke.color.code;
        thickness = stroke.thickness;
        dash = stroke.dash;
    }
    let update = $$props.update;
</script>

<path stroke={color}
    stroke-width={thickness}
    stroke-dasharray={dash}
    name={"stroke-" + update}
    d={cubicPath}>
</path>

<style>
    path {
        fill: none;
        opacity: 0.7;
    }
</style>