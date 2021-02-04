<script>
    import { createEventDispatcher } from "svelte";

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
        font-weight: bolder;
        padding: 5px 10px;
        background: cadetblue;
        color: whitesmoke;
        box-shadow: 0 0 5px black;
    }
</style>