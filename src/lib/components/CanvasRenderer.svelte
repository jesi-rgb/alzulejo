<script lang="ts">
	import { onMount } from "svelte";
	import { Point } from "../../core/geometry/point.svelte";
	import { Polygon } from "../../core/geometry/polygon.svelte";

	let canvasRef: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D | null = $state(null);

	// Reactive polygons
	let currentPolygon = $state(
		new Polygon({ sides: 3, radius: 90, centerX: 350, centerY: 300 }),
	);

	function createPolygon(sides: number) {
		currentPolygon = new Polygon({
			sides,
			radius: 70,
			centerX: 350,
			centerY: 300,
		});
	}

	function draw() {
		if (!ctx || !canvasRef) return;

		ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
		currentPolygon.draw(ctx);
	}

	// Redraw when polygon changes
	$effect(() => {
		currentPolygon.vertices;
		draw();
	});

	onMount(() => {
		const dpr = window.devicePixelRatio || 1;
		const rect = canvasRef.getBoundingClientRect();

		canvasRef.width = rect.width * dpr;
		canvasRef.height = rect.height * dpr;

		ctx = canvasRef.getContext("2d");
		ctx.scale(dpr, dpr);

		draw();
	});

	function updatePolygon(type: string) {
		switch (type) {
			case "triangle":
				currentPolygon = new Polygon({
					sides: 3,
					radius: 70,
					centerX: 200,
					centerY: 150,
				});
				break;
			case "square":
				currentPolygon = new Polygon({
					sides: 4,
					radius: 70,
					centerX: 200,
					centerY: 150,
				});
				break;
			case "pentagon":
				currentPolygon = new Polygon({
					sides: 5,
					radius: 70,
					centerX: 200,
					centerY: 150,
				});
				break;
			case "hexagon":
				currentPolygon = new Polygon({
					sides: 6,
					radius: 70,
					centerX: 200,
					centerY: 150,
				});
				break;
		}
	}
</script>

<canvas bind:this={canvasRef}></canvas>

<div>
	<button onclick={() => createPolygon(3)}>Triangle</button>
	<button onclick={() => createPolygon(4)}>Square</button>
	<button onclick={() => createPolygon(5)}>Pentagon</button>
	<button onclick={() => createPolygon(6)}>Hexagon</button>
	<button onclick={() => createPolygon(8)}>Octagon</button>
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
