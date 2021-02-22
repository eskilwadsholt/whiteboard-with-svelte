<script>
    import { flip } from 'svelte/animate';

    export let color;

    const linestyles = [
        { id: 1, thickness: 2, dash: 0 },
        { id: 0, thickness: 3, dash: 0 },
        { id: 2, thickness: 8, dash: 0 },
        { id: 3, thickness: 2, dash: 8 },
        { id: 4, thickness: 3, dash: 12 },
    ]

    export let selectedStyle = linestyles[0];
    let open=false;
    export let openMenus;
    $: if (open) openMenus.linestylepicker = true; else openMenus.linestylepicker = false;
    export let hide;

    function toggleOpen() {
        open = !open;
    }

    function select(i) {
        selectedStyle = linestyles[i];
        //console.log("New selected style in picker: " + JSON.stringify(selectedStyle));
    }

    const animOptions = {
        duration: 500,
    }

    const pathData = `
    M -5 25
    C 11 14 16 14.5 20 15
    C 24 15.5 32 23 45 25
    `;
</script>

<div class="palette"
    class:hide
    class:open
    on:click={toggleOpen}
    on:touchstart={toggleOpen}>
    {#each linestyles as linestyle (linestyle.id)}
        <div
            animate:flip={animOptions}
            class:highlight={linestyle === selectedStyle}
            on:click={() => select(linestyle.id)}
            on:touchstart={() => select(linestyle.id)}
            class:open
            class="linestyle"
            id={linestyle.id}>
            <svg width="40px" height="40px">
                <path
                    stroke={color?.code}
                    stroke-width={linestyle.thickness}
                    stroke-dasharray={linestyle.dash}
                    d={pathData}
                ></path>
            </svg>
        </div>
    {/each}
</div>

<style>
    .palette {
        position: relative;
        display: flex;
        margin: 0 10px;
    }
    .linestyle {
        position: absolute;
        left: 0;
        top: 0;
        width: fit-content;
        height: fit-content;
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
        z-index: 10;
    }
    svg {
        background: #BBB;
        border-radius: 5px;
        border: 2px solid #888;
    }
    .highlight svg {
        background: #666;
    }
    path {
        fill: none;
    }
</style>