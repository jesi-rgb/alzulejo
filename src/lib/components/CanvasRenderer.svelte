<script lang="ts">
	import { onMount } from "svelte";
	import { Polygon } from "@lib/core/geometry/polygon.svelte";
	import { Canvas } from "@lib/render/canvas.svelte";

	const canvas = new Canvas({ width: 700, height: 600 });

	// Reactive polygons
	let currentPolygon = $state(
		new Polygon({
			sides: 3,
			radius: 90,
			centerX: 350,
			centerY: 300,
			style: {
				fill: "#00ff00",
				fillOpacity: 0.5,
				stroke: "blue",
				strokeWidth: 5,
				strokeOpacity: 0.5,
			},
		}),
	);

	function createPolygon(sides: number) {
		canvas.clearRenderables();
		currentPolygon = new Polygon({
			sides,
			radius: 70,
			centerX: 350,
			centerY: 300,
		});
		canvas.add(currentPolygon);
	}

	onMount(() => {
		if (canvas.canvas) {
			canvas.setup(canvas.canvas);
			canvas.add(currentPolygon);
		}
	});
</script>

<canvas bind:this={canvas.canvas}></canvas>

<div>
	<button class="button" onclick={() => createPolygon(3)}>Triangle</button>
	<button class="button" onclick={() => createPolygon(4)}>Square</button>
	<button class="button" onclick={() => createPolygon(5)}>Pentagon</button>
	<button class="button" onclick={() => createPolygon(6)}>Hexagon</button>
	<button class="button" onclick={() => createPolygon(8)}>Octagon</button>
</div>

<p>Area: {currentPolygon.area.toFixed(2)}</p>
<p>Perimeter: {currentPolygon.perimeter.toFixed(2)}</p>

<style>
	canvas {
		border: 1px solid #ccc;
		width: 700px;
		height: 600px;
	}
	button {
		margin: 5px;
	}
</style>
