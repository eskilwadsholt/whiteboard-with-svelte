<script>
    import { each } from "svelte/internal";
    import Color from "./Color.svelte";

    const colors = [
        { name: "white", code: "#FFF" },
        { name: "red", code: "#F00" },
        { name: "green", code: "#0F0" },
        { name: "blue", code: "#00F" },
    ]

    export let selected = $$props.selected;
</script>

<div class="palette">
    {#each colors as color}
        <Color {color} bind:setSelected={selected}/>
    {/each}
</div>

<style>
    .palette {
        display: flex;
    }
</style>