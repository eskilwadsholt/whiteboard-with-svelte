<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("undo");
    }
    export let hide;
</script>

<div class:hide class="undo" on:click={handleClick} on:touchstart={handleClick}>
    Undo
</div>

<style>
    .undo {
        display: flex;
        align-items: center;
        justify-content: center;
        font-variant: small-caps;
        font-weight: bolder;
        padding: 5px 10px;
        background:burlywood;
        color: black;
        text-shadow: 0 0 10px white;
        box-shadow: 0 0 5px black;
        border-radius: 5px;
        height: 40px;
    }
    .hide {
        position: absolute;
        visibility: hidden;
    }
</style>