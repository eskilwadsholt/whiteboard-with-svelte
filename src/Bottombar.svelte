<script>
    import Clear from "./Clear.svelte";
    import ColorPicker from "./ColorPicker.svelte";
    import ThicknessPicker from "./ThicknessPicker.svelte";
    import Undo from "./Undo.svelte";
    export let selectedColor;
    function stopEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    export let thickness;
</script>

<div class="bottombar"
    on:mousedown={stopEvent}
    on:mousemove={stopEvent}
    on:mouseup={stopEvent}
    on:touchstart={stopEvent}
    on:touchmove={stopEvent}
    on:touchend={stopEvent}
    >
    <Undo on:undo/>
    <ColorPicker bind:selected={selectedColor}/>
    <ThicknessPicker
        bind:thickness={thickness}
        color={selectedColor}/>
    <Clear on:clear/>
</div>

<style>
    .bottombar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background: #333;
        padding: 0 10px;
    }
</style>