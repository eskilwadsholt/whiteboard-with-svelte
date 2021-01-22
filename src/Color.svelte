<script>
    export let setSelected;
    $: highlight = setSelected === $$props.color;
    const handleClick = (e) => {
        setSelected=$$props.color;
        e.stopPropagation();
    }
</script>

<div
    class:highlight
    on:click={handleClick}
    on:touchstart={handleClick}
    class="color"
    id={$$props.color.name}
    style="background: {$$props.color.code}">
</div>

<style>
    .color {
        width: 40px;
        height: 40px;
        margin: 5px;
    }
    .highlight {
        border: 2px solid black;
        outline: 2px solid white;
    }
</style>