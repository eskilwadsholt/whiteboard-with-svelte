<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("undo");
    }
</script>

<div class="undo" on:click={handleClick} on:touchstart={handleClick}>
    Undo
</div>

<style>
    .undo {
        font-variant: small-caps;
        font-weight: bolder;
        padding: 5px 10px;
        background: rebeccapurple;
        color: whitesmoke;
        text-shadow: 2px 2px black;
        box-shadow: 0 0 5px black;
    }
</style>