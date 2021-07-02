<script>
    export let stroke;
    let color = `#FFF`;
    let thickness = 4;
    let dash = 0;

    $: path = stroke.first + stroke.middle + stroke.ending;;
    
    $: if (stroke) {
        color = stroke.color.code;
        thickness = stroke.thickness;
        dash = stroke.dash;
    }

</script>

<path
    stroke={color}
    stroke-width={thickness}
    stroke-dasharray={dash}
    d={path}>
</path>

<style>
    path {
        fill: none;
        opacity: 0.7;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>