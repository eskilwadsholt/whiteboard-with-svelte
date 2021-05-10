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
        display: flex;
        align-items: center;
        justify-content: center;
        font-variant: small-caps;
        font-weight: bolder;
        padding: 5px 10px;
        background: cornflowerblue;
        color: black;
        text-shadow: 0 0 10px white;
        box-shadow: 0 0 5px black;
        border-radius: 5px;
        height: 40px;
    }
</style>