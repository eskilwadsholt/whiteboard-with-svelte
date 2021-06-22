<script>
    import Clear from "./Clear.svelte";
    import StylePicker from "./StylePicker.svelte";
    import Undo from "./Undo.svelte";

    //export let selectedColor; // = { id: 3, name: "white", code: "#FFF" };
    export let linestyle; // = { id: 0, thickness: 2, dash: 0 };

    function stopEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }
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
    <StylePicker
        bind:selectedStyle={linestyle}/>
    <Clear on:clear/>
</div>

<style>
    .bottombar {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background: #555;
        padding: 0 10px;
        cursor: context-menu;
    }
</style>