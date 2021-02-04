<script>
    //$: stroke = $$props.stroke.smoothPoints;
    export let stroke;
    $: path = stroke.first + stroke.middle + stroke.ending;
    let color = `#FFF`;
    let thickness = 8;
    $: if (stroke) {
        color = stroke.color.code;
        thickness = stroke.thickness;
    }
    let update = $$props.update;
    let path = "";
</script>

<path stroke={color} stroke-width={thickness} name={"stroke-" + update} d={path}></path>

<style>
    path {
        fill: none;
        opacity: 0.7;
    }
</style>