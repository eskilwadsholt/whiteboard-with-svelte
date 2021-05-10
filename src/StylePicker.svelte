<script>
    const colors = [
        { id: 0, name: "red", code: "#F00" },
        { id: 1, name: "green", code: "#0F0" },
        { id: 2, name: "blue", code: "#00F" },
        { id: 3, name: "white", code: "#FFF" },
        { id: 4, name: "black", code: "#000" },
        { id: 5, name: "yellow", code: "yellow" },
    ]

    const linestyles = [
        { id: 0, thickness: 2, dash: 0 },
        { id: 1, thickness: 3, dash: 0 },
        { id: 2, thickness: 5, dash: 0 },
        { id: 3, thickness: 8, dash: 0 },
        { id: 4, thickness: 2, dash: 10 },
        { id: 5, thickness: 3, dash: 15 },
    ]

    export let selectedColor = colors[3];
    export let selectedStyle = linestyles[0];

    let open = false;

    function toggleOpen() {
        open = !open;
    }

    function selectColor(i) {
        selectedColor = colors[i];
    }

    function selectStyle(i) {
        selectedStyle = linestyles[i];
    }

    const pathData = `
    M -5 25
    C 11 14 16 14.5 20 15
    C 24 15.5 32 23 50 25
    `;
</script>

{#if open}
<div class="overlay"
on:click={toggleOpen}
on:touchstart={toggleOpen}>
</div>
{/if}
<div class="stylepicker">
    <div class="colors" class:open>
        {#each colors as color (color.id)}
            <div
                class:highlight={color === selectedColor}
                on:click={() => selectColor(color.id)}
                on:touchstart={() => selectColor(color.id)}
                class:open
                class="color"
                id={color.name}
                style="background: {color.code}">
            </div>
        {/each}
    </div>
    <div class="linestyles" class:open>
        {#each linestyles as linestyle (linestyle.id)}
            <div
                class:highlight={linestyle === selectedStyle}
                on:click={() => selectStyle(linestyle.id)}
                on:touchstart={() => selectStyle(linestyle.id)}
                class="linestyle"
                id={linestyle.id}>
                <svg width="40px" height="40px">
                    <path
                        stroke={selectedColor.code}
                        stroke-width={linestyle.thickness}
                        stroke-dasharray={linestyle.dash}
                        d={pathData}
                    ></path>
                </svg>
            </div>
        {/each}
    </div>
    <div class="linestyle selected"
        on:click={toggleOpen}
        on:touchstart={toggleOpen}>
        <svg width="40px" height="40px">
            <path
                stroke={selectedColor.code}
                stroke-width={selectedStyle.thickness}
                stroke-dasharray={selectedStyle.dash}
                d={pathData}
            ></path>
        </svg>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #AAF2;
    }
    .stylepicker {
        position: absolute;
        left: 50%;
        top: 5px;
        width: fit-content;
    }
    .linestyles, .colors {
        position: absolute;
        bottom: 6px;
        width: 142px;
        display: flex;
        flex-wrap: wrap;
        background: #789;
        padding: 4px;
        border: 1px solid black;
        transform: scale(0);
        opacity: 0;
        -webkit-transition: all 200ms ease-in-out;
        -moz-transition: all 200ms ease-in-out;
        -o-transition: all 200ms ease-in-out;
        -ms-transition: all 200ms ease-in-out;
        transition: all 200ms ease-in-out;
    }
    .linestyles {
        border-radius: 0 5px 5px 0;
        left: 0;
        transform-origin: bottom left;
    }
    .colors {
        border-radius: 5px 0 0 5px;
        right: 0;
        transform-origin: bottom right;
    }
    .linestyles.open, .colors.open {
        opacity: 1;
        transform: scale(1);
    }
    .linestyle, .color {
        margin: 2px;
        width: 40px;
        height: 40px;
    }
    .linestyle.highlight {
        outline: 2px solid white;
    }
    .color.highlight {
        border: 2px solid #333;
        outline: 2px solid white;
    }
    .highlight svg {
        background: #666;
    }
    .selected {
        position: absolute;
        left: 0;
        top: 0;
        transform: translate(-50%);
        z-index: 20;
    }
    svg {
        background: #BBB;
        border-radius: 5px;
    }
    path {
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>