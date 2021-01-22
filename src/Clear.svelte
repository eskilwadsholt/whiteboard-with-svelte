<script>
    import { createEventDispatcher } from "svelte";
import { each } from "svelte/internal";

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("clear");
    }
</script>

<div class="clear" on:click={handleClick} on:touchstart={handleClick}>
    Clear
</div>

<style>
    .clear {
        font-variant: small-caps;
        padding: 5px 10px;
        background: cadetblue;
        color: black;
    }
</style>