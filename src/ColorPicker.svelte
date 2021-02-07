<script>
    import { flip } from 'svelte/animate';

    const colors = [
        { id: 0, name: "white", code: "#FFF" },
        { id: 1, name: "red", code: "#F00" },
        { id: 2, name: "green", code: "#0F0" },
        { id: 3, name: "blue", code: "#00F" },
        { id: 4, name: "yellow", code: "yellow" },
    ]

    export let selected = colors[0];
    let open=false;
    export let openMenus;
    $: if (open) openMenus.colorpicker = true; else openMenus.colorpicker = false;
    export let hide;

    function toggleOpen() {
        open = !open;
    }

    function select(i) {
        selected = colors[i];
    }

    const animOptions = {
        duration: 500,
    }
</script>

<div class="palette"
    class:hide
    class:open
    on:click={toggleOpen}
    on:touchstart={toggleOpen}>
    {#each colors as color (color.id)}
        <div
            animate:flip={animOptions}
            class:highlight={color === selected}
            on:click={() => select(color.id)}
            on:touchstart={() => select(color.id)}
            class:open
            class="color"
            id={color.name}
            style="background: {color.code}">
        </div>
    {/each}
    <!--Color animate:flip {color} bind:setSelected={selected}/-->
</div>

<style>
    .palette {
        position: relative;
        display: flex;
        margin: 0 10px;
    }
    .color {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 40px;
        margin: 5px;
    }
    .hide {
        position: absolute;
        visibility: hidden;
    }
    .open {
        visibility: visible;
        position: relative;
        left: initial;
        top: initial;
    }
    .highlight {
        position: relative;
        border: 2px solid black;
        outline: 2px solid white;
        z-index: 10;
    }
</style>