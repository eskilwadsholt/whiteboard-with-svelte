<script>
    import { each } from "svelte/internal";
    $: data = $$props.touchData;
    $: touches = ("touches" in data) ? data.touches : [];
</script>

<div class="touchdata">
    {#each touches as touch, i}
        <div>
            Touch {i + 1}: ({touch.clientX.toFixed(1)},{touch.clientY.toFixed(1)})
        </div>
    {/each}
</div>