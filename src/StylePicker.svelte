<script>
    import { line } from './stores/settings';

    let open = false;

    function toggleOpen() {
        open = !open;
    }

    function selectColor(color) {
        $line.color = color;
    }

    function selectStyle(linestyle) {
        $line.style = linestyle;
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
        {#each $line.colors as color (color.id)}
            <div
                class:highlight={color === $line.color}
                on:click={() => selectColor(color)}
                on:touchstart={() => selectColor(color)}
                class:open
                class="color"
                id={color.name}
                style="background: {color.code}">
            </div>
        {/each}
    </div>
    <div class="linestyles" class:open>
        {#each $line.styles as linestyle (linestyle.id)}
            <div
                class:highlight={linestyle === $line.style}
                on:click={() => selectStyle(linestyle)}
                on:touchstart={() => selectStyle(linestyle)}
                class="linestyle"
                id={linestyle.id}>
                <svg width="40px" height="40px">
                    <path
                        stroke={$line.color.code}
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
                stroke={$line.color.code}
                stroke-width={$line.style.thickness}
                stroke-dasharray={$line.style.dash}
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