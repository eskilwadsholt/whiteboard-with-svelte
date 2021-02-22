<script>
	import Whiteboard from "./Whiteboard.svelte";
	function handleContextMenu(e) {
		e.preventDefault();
	}
</script>

<main on:contextmenu={handleContextMenu}>
	<Whiteboard/>
</main>
	
<style>
	main {
		width: 100%;
		height: 100%;
		background: #444;
		cursor: crosshair;
	}
</style>