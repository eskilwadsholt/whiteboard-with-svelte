<script>
    import Clear from "./Clear.svelte";
    import ColorPicker from "./ColorPicker.svelte";
    export let selectedColor = $$props.selectedColor;
</script>

<div class="bottombar">
    <div class="selected-text" style="color:{selectedColor.code}">
        {selectedColor.name}
    </div>
    <ColorPicker bind:selected={selectedColor}/>
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
    .selected-text {
        font-variant: small-caps;
        width: 60px;
    }
</style>