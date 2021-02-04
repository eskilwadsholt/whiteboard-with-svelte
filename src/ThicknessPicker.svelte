<script>
    import { flip } from 'svelte/animate';
    import { each } from "svelte/internal";

    export let color;
    export let thickness;

    const thicknesses = [
        { id: 0, thickness: 2 },
        { id: 1, thickness: 5 },
        { id: 2, thickness: 8 },
        { id: 3, thickness: 12 },
        { id: 4, thickness: 18 },
    ]

    let selectedThickness = thicknesses[1];
    $: thickness = selectedThickness.thickness;
    let open=false;

    function toggleOpen() {
        open = !open;
    }

    function select(i) {
        selectedThickness = thicknesses[i];
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
    on:click={toggleOpen}
    on:touchstart={toggleOpen}>
    {#each thicknesses as thickness (thickness.id)}
        <div
            animate:flip={animOptions}
            class:highlight={thickness === selectedThickness}
            class:open
            on:click={() => select(thickness.id)}
            on:touchstart={() => select(thickness.id)}
            class="thickness"
            id={thickness.id}>
            <svg width="40px" height="40px">
                <path
                    stroke={color?.code}
                    stroke-width={thickness.thickness}
                    d={pathData}
                ></path>
            </svg>
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
    .thickness {
        position: absolute;
        left: 0;
        top: 0;
        width: fit-content;
        height: fit-content;
        margin: 5px;
    }
    .open {
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