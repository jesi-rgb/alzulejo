<script lang="ts">
	import { onMount } from "svelte";
	import { Polygon, Tessellation } from "../core/geometry";
	import { Canvas } from "../render/canvas.svelte";
	import type { Style } from "../core/geometry/style.svelte";

	const canvas = new Canvas({ width: 700, height: 600 });

	const style: Style = {
		fill: "var(--accent-color)",
		fillOpacity: 0.9,
		stroke: "var(--text-primary)",
		strokeWidth: 0.5,
		strokeOpacity: 1,
	};

	let mode = $state<"polygon" | "tessellation">("tessellation");
	let tessellationType = $state<"triangle" | "square" | "hexagon">(
		"triangle",
	);

	let currentPolygon = $state(
		new Polygon({
			sides: 3,
			radius: 30,
			centerX: 350,
			centerY: 300,
			style: style,
		}),
	);

	let radius = 10;
	let tri = $state(
		new Polygon({
			sides: 3,
			radius: radius,
			centerX: 350 - radius,
			centerY: 300 - radius / 2,
			style: style,
		}).rotate(Math.PI),
	);

	let currentTessellation = $state(
		new Tessellation({
			type: "triangle",
			size: 30,
			width: 700,
			height: 600,
			spacing: 0,
			style: style,
		}),
	);

	canvas.add(currentTessellation);
	function createPolygon(sides: number) {
		canvas.clearRenderables();
		currentPolygon = new Polygon({
			sides,
			radius: 70,
			centerX: 350,
			centerY: 300,
			style: style,
		});
		canvas.add(currentPolygon);
	}

	function createTessellation(type: "triangle" | "square" | "hexagon") {
		canvas.clearRenderables();
		tessellationType = type;
		currentTessellation = new Tessellation({
			type,
			size: 30,
			width: 700,
			height: 600,
			spacing: 2,
			style: style,
		});
	}

	function switchMode(newMode: "polygon" | "tessellation") {
		mode = newMode;
		canvas.clearRenderables();

		if (mode === "polygon") {
			canvas.add(currentPolygon);
		} else {
			canvas.add(currentTessellation);
		}
	}

	onMount(() => {
		if (canvas.canvas) {
			canvas.setup(canvas.canvas);
			// canvas.add(currentPolygon);
		}
	});
</script>

<canvas bind:this={canvas.canvas} width="100%"></canvas>

<div class="controls">
	<div class="mode-selector">
		<button
			class="mode-btn {mode === 'polygon' ? 'active' : ''}"
			onclick={() => switchMode("polygon")}
		>
			Single Polygons
		</button>
		<button
			class="mode-btn {mode === 'tessellation' ? 'active' : ''}"
			onclick={() => switchMode("tessellation")}
		>
			Tessellations
		</button>
	</div>

	{#if mode === "polygon"}
		<div class="button-group">
			<button class="button" onclick={() => createPolygon(3)}
				>Triangle</button
			>
			<button class="button" onclick={() => createPolygon(4)}
				>Square</button
			>
			<button class="button" onclick={() => createPolygon(5)}
				>Pentagon</button
			>
			<button class="button" onclick={() => createPolygon(6)}
				>Hexagon</button
			>
			<button class="button" onclick={() => createPolygon(8)}
				>Octagon</button
			>
		</div>
		<div class="info">
			<p>Area: {currentPolygon.area.toFixed(2)}</p>
			<p>Perimeter: {currentPolygon.perimeter.toFixed(2)}</p>
		</div>
	{:else}
		<div class="button-group">
			<button
				class="button {tessellationType === 'triangle' ? 'active' : ''}"
				onclick={() => createTessellation("triangle")}
			>
				Triangle Tiling
			</button>
			<button
				class="button {tessellationType === 'square' ? 'active' : ''}"
				onclick={() => createTessellation("square")}
			>
				Square Tiling
			</button>
			<button
				class="button {tessellationType === 'hexagon' ? 'active' : ''}"
				onclick={() => createTessellation("hexagon")}
			>
				Hexagon Tiling
			</button>
		</div>
		<div class="info">
			<p>Polygons: {currentTessellation.bounds.polygonCount}</p>
			<p>Type: {tessellationType} tessellation</p>
		</div>
	{/if}
</div>

<style>
	canvas {
		border: 1px solid #ccc;
		width: 700px;
		height: 600px;
	}

	.controls {
		margin-top: 20px;
	}

	.mode-selector {
		margin-bottom: 15px;
	}

	.mode-btn {
		padding: 8px 16px;
		margin: 0 5px;
		border: 2px solid #ccc;
		cursor: pointer;
		border-radius: 4px;
	}

	.mode-btn.active {
		border-color: #007acc;
	}

	.button-group {
		margin-bottom: 15px;
	}

	.button {
		margin: 5px;
		padding: 8px 12px;
		border: 1px solid #ccc;
		cursor: pointer;
		border-radius: 4px;
	}

	.button.active {
		border-color: #007acc;
	}

	.info p {
		margin: 5px 0;
		font-family: monospace;
	}
</style>
