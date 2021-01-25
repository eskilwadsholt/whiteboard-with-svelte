<script>
    //$: stroke = $$props.stroke.smoothPoints;
    export let stroke;
    $: path = stroke.first + stroke.middle + stroke.ending;
    let color = `#FFF`;
    $: if (stroke.color) {
        color = stroke.color.code;
    }
    let update = $$props.update;
    let path = "";
</script>

<path stroke={color} name={"stroke-" + update} d={path}></path>

<style>
    path {
        fill: none;
        opacity: 0.7;
        stroke-width: 5px;
    }
</style>