<script>
    import Clear from "./Clear.svelte";
    import ColorPicker from "./ColorPicker.svelte";
    import LinestylePicker from "./LinestylePicker.svelte";
    //import ThicknessPicker from "./ThicknessPicker.svelte";
    import Undo from "./Undo.svelte";
    export let selectedColor;
    function stopEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    //export let thickness;
    export let linestyle;
    let openSubMenus = {};
    $: hide = openSubMenus.colorpicker || openSubMenus.linestylepicker;
</script>

<div class="bottombar"
    on:mousedown={stopEvent}
    on:mousemove={stopEvent}
    on:mouseup={stopEvent}
    on:touchstart={stopEvent}
    on:touchmove={stopEvent}
    on:touchend={stopEvent}
    >
    <Undo {hide} on:undo/>
    <ColorPicker {hide} bind:openMenus={openSubMenus} bind:selected={selectedColor}/>
    <!--ThicknessPicker
        {hide}
        bind:openMenus={openSubMenus}
        bind:thickness={thickness}
        color={selectedColor}/-->
    <LinestylePicker
        {hide}
        bind:openMenus={openSubMenus}
        bind:selectedStyle={linestyle}
        color={selectedColor}/>
    <Clear {hide} on:clear/>
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
    }
</style>