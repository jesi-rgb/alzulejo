<script lang="ts">
	import { onMount } from "svelte";
	import { Tessellation } from "@lib/core/geometry";
	import { Canvas } from "@lib/render/canvas.svelte";
	import type { Style } from "../lib/core/geometry/style.svelte";

	interface AppSettings {
		tessellationType:
			| "triangle"
			| "square"
			| "hexagon"
			| "octagon-square"
			| "rhombitrihexagonal"
			| "truncated-hexagonal"
			| "snub-square";
		size: number;

		contactAngle: number;
		motifColor: string;
		showPolygons: boolean;
		showMidpoints: boolean;
		showRays: boolean;
		showMotif: boolean;
		showMotifFilled: boolean;
		showIntersectionPoints: boolean;
		showVertices: boolean;
	}

	const defaultSettings: AppSettings = {
		tessellationType: "truncated-hexagonal",
		size: 150,
		contactAngle: 158,
		motifColor: "var(--primary)",
		showPolygons: true,
		showMidpoints: false,
		showRays: false,
		showMotif: false,
		showMotifFilled: true,
		showIntersectionPoints: false,
		showVertices: false,
	};

	let settings = $state<AppSettings>({ ...defaultSettings });
	let canvas = $state<Canvas>();
	let canvasElement: HTMLCanvasElement;
	let resizeObserver: ResizeObserver;

	let style = $state<Style>({
		fill: "#2c3e50",
		fillOpacity: 1,
		stroke: "#1a252f",
		strokeWidth: 1.5,
		strokeOpacity: 1,
		motifColor: "#e67e22",
	});

	let style1 = $state<Style>({
		fill: "#34495e",
		fillOpacity: 0.7,
		stroke: "#1a252f",
		strokeWidth: 1.5,
		strokeOpacity: 1,
		motifColor: "#819A7F",
	});

	let style2 = $state<Style>({
		fill: "#f39c12",
		fillOpacity: 0.7,
		stroke: "#d68910",
		strokeWidth: 1.5,
		strokeOpacity: 1,
		motifColor: "#5D7583",
	});

	let style3 = $state<Style>({
		fill: "#27ae60",
		fillOpacity: 0.7,
		stroke: "#1e8449",
		strokeWidth: 1.5,
		strokeOpacity: 1,
		motifColor: "#2c3e50",
	});

	let tessellation = new Tessellation({
		type: "rhombitrihexagonal",
		size: 90,
		width: 400,
		height: 300,
		contactAngle: 22.5,
		style: style,
		style1: style1,
		style2: style2,
		style3: style3,
		backgroundColor: "#212121",
		// rosette: true,
	});

	function initializeCanvas() {
		if (!canvas || !canvasElement) return;

		canvas.setup(canvasElement);
		updateTessellationSize();

		canvas.add(
			tessellation,
			settings.showPolygons,
			settings.showMidpoints,
			settings.showRays,
			settings.showMotif,
			settings.showMotifFilled,
			settings.showIntersectionPoints,
			canvas,
			settings.showVertices,
		);
	}

	function updateTessellationSize() {
		if (!canvas || !canvasElement) return;

		const rect = canvasElement.getBoundingClientRect();
		tessellation.width = rect.width;
		tessellation.height = rect.height;
	}

	function handleCanvasResize() {
		if (!canvas || !canvasElement) return;

		canvas.updateSize();
		updateTessellationSize();
		updateVisualization();
	}

	function setTessellationType(
		type:
			| "triangle"
			| "square"
			| "hexagon"
			| "octagon-square"
			| "rhombitrihexagonal",
	) {
		tessellation.type = type;
		settings.tessellationType = type;
		updateVisualization();
	}

	function updateVisualization() {
		if (!canvas) return;

		tessellation.style = style;
		tessellation.style1 = style1;
		tessellation.style2 = style2;
		tessellation.style3 = style3;

		canvas.clearRenderables();
		canvas.update(
			tessellation,
			settings.showPolygons,
			settings.showMidpoints,
			settings.showRays,
			settings.showMotif,
			settings.showMotifFilled,
			settings.showIntersectionPoints,
			canvas,
			settings.showVertices,
		);
	}

	onMount(() => {
		tessellation.size = settings.size;

		tessellation.contactAngle = settings.contactAngle;
		tessellation.motifColor = settings.motifColor;
		tessellation.type = settings.tessellationType;

		canvas = new Canvas();

		initializeCanvas();

		// Set up ResizeObserver to handle canvas resizing
		if (canvasElement) {
			resizeObserver = new ResizeObserver(handleCanvasResize);
			resizeObserver.observe(canvasElement);
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	});
</script>

<div class="app-container">
	<main class="main-layout">
		<div class="canvas-section">
			<canvas bind:this={canvasElement}></canvas>
		</div>

		<aside class="parameters-section card">
			<div>
				<h3 class="text-primary">Pattern Generator</h3>
			</div>
			<div class="control-section">
				<h3 class="text-primary">Tessellation Type</h3>
				<div class="button-group">
					<button
						class="btn {tessellation.type === 'triangle'
							? 'btn-primary'
							: 'btn-neutral'}"
						onclick={() => setTessellationType("triangle")}
					>
						Triangle
					</button>
					<button
						class="btn {tessellation.type === 'square'
							? 'btn-primary'
							: 'btn-neutral'}"
						onclick={() => setTessellationType("square")}
					>
						Square
					</button>
					<button
						class="btn {tessellation.type === 'hexagon'
							? 'btn-primary'
							: 'btn-neutral'}"
						onclick={() => setTessellationType("hexagon")}
					>
						Hexagon
					</button>
					<button
						class="btn {tessellation.type === 'octagon-square'
							? 'btn-primary'
							: 'btn-neutral'}"
						onclick={() => setTessellationType("octagon-square")}
					>
						Octagon-Square
					</button>

					<button
						class="btn {tessellation.type === 'rhombitrihexagonal'
							? 'btn-primary'
							: 'btn-neutral'}"
						onclick={() =>
							setTessellationType("rhombitrihexagonal")}
					>
						rhombitrihexagonal
					</button>
				</div>
			</div>

			<div class="control-section">
				<h3 class="text-secondary">Parameters</h3>
				<div class="slider-controls">
					<div class="slider-control">
						<label for="tessellation-size"
							>Size: {tessellation.size}</label
						>
						<input
							id="tessellation-size"
							type="range"
							min="5"
							max="280"
							bind:value={tessellation.size}
							oninput={(e) => {
								tessellation.size = Number(e.target.value);
								updateVisualization();
							}}
						/>
					</div>

					<div class="slider-control">
						<label for="contact-angle"
							>Contact Angle: {tessellation.contactAngle}°</label
						>
						<input
							id="contact-angle"
							type="range"
							min="0"
							max="360"
							step="0.5"
							bind:value={tessellation.contactAngle}
							oninput={(e) => {
								tessellation.contactAngle = Number(
									e.target.value,
								);
								updateVisualization();
							}}
						/>
					</div>
				</div>
			</div>

			{#if canvas}
				<div class="control-section">
					<h3 class="text-secondary">Animation</h3>
					<div class="slider-controls">
						<div class="slider-control">
							<label for="animation-duration"
								>Duration: {canvas.animationDuration}ms</label
							>
							<input
								id="animation-duration"
								type="range"
								min="100"
								max="3000"
								step="50"
								bind:value={canvas.animationDuration}
							/>
						</div>

						<div class="slider-control">
							<label for="stagger-delay"
								>Stagger: {canvas.staggerDelay}ms</label
							>
							<input
								id="stagger-delay"
								type="range"
								min="0"
								max="2500"
								step="10"
								bind:value={canvas.staggerDelay}
							/>
						</div>
					</div>
				</div>
			{/if}

			<div class="control-section">
				<h3 class="text-info">Colors</h3>
				<div class="color-controls">
					<div class="color-control">
						<label for="background-color">Background:</label>
						<input
							id="background-color"
							type="color"
							bind:value={tessellation.backgroundColor}
							oninput={() => updateVisualization()}
						/>
					</div>
					<div class="color-control">
						<label for="style1-color">Style 1:</label>
						<input
							id="style1-color"
							type="color"
							bind:value={style1.motifColor}
							oninput={() => updateVisualization()}
						/>
					</div>
					<div class="color-control">
						<label for="style2-color">Style 2:</label>
						<input
							id="style2-color"
							type="color"
							bind:value={style2.motifColor}
							oninput={() => updateVisualization()}
						/>
					</div>
					<div class="color-control">
						<label for="style3-color">Style 3:</label>
						<input
							id="style3-color"
							type="color"
							bind:value={style3.motifColor}
							oninput={() => updateVisualization()}
						/>
					</div>
				</div>
			</div>

			<div class="control-section">
				<h3 class="text-accent">Visibility</h3>
				<div class="checkbox-group">
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showPolygons}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Polygons
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showMidpoints}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Midpoints
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showRays}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Rays
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showMotif}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Motif
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showMotifFilled}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Filled Motif
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showIntersectionPoints}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Intersection Points
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showVertices}
							onchange={() => {
								updateVisualization();
							}}
						/>
						Show Vertices
					</label>
				</div>
			</div>

			<div class="info bg-base-300 text-base-content">
				<p>
					<strong class="text-info">Polygons:</strong>
					{tessellation.num_elements}
				</p>
				<p>
					<strong class="text-info">Type:</strong>
					{tessellation.type} tessellation
				</p>
				<p>
					<strong class="text-info">Canvas:</strong>
					{Math.round(tessellation.width)} × {Math.round(
						tessellation.height,
					)}
				</p>
			</div>
		</aside>
	</main>
</div>

<style>
	.app-container {
		min-height: 90vh;
		background-color: var(--base-100);
		font-family: "Roslindale Text";
		overflow: hidden;
	}

	.main-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		height: calc(100vh - 80px);
		gap: 1rem;
		padding: 1rem;
	}

	.canvas-section {
		background-color: var(--base-100);
		border: 2px solid var(--primary);
		border-radius: 0.5rem;
		display: flex;
		overflow: hidden;
	}

	canvas {
		max-width: 100%;
		max-height: 100%;
		display: block;
		border-radius: 0.25rem;
		background-color: var(--base-100);
	}

	.parameters-section {
		padding: 1rem;
		overflow-y: auto;
		font-size: 0.875rem;
	}

	.control-section {
		margin-bottom: 1.5rem;
	}

	.control-section:last-child {
		margin-bottom: 0;
	}

	.control-section h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		border-bottom: 2px solid currentColor;
		padding-bottom: 0.25rem;
		display: inline-block;
	}

	.button-group {
		font-family: "Roslindale Text";
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.slider-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.slider-control label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		font-size: 0.875rem;
		color: var(--base-content);
	}

	.slider-control input[type="range"] {
		width: 100%;
		height: 7px;
		border-radius: 5px;
		background: var(--base-200);
		outline: none;
		-webkit-appearance: none;
		opacity: 0.9;
	}

	.slider-control input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: var(--base-100);
		cursor: pointer;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.slider-control input[type="range"]::-moz-range-thumb {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--base-100);
		cursor: pointer;
		border: 3px solid var(--accent);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.info {
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--base-300);
		font-family: monospace;
		font-size: 0.75rem;
	}

	.info p {
		margin: 0.25rem 0;
	}

	.info p:first-child {
		margin-top: 0;
	}

	.info p:last-child {
		margin-bottom: 0;
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.checkbox-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--base-content);
		cursor: pointer;
	}

	.checkbox-control input[type="checkbox"] {
		width: 16px;
		height: 16px;
		accent-color: var(--accent);
		cursor: pointer;
	}

	.color-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.color-control {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.color-control label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--base-content);
	}

	.color-control input[type="color"] {
		width: 40px;
		height: 30px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background: none;
		padding: 0;
	}

	.color-control input[type="color"]::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.color-control input[type="color"]::-webkit-color-swatch {
		border: 2px solid var(--base-300);
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.main-layout {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
			height: auto;
			min-height: calc(100vh - 80px);
		}

		.canvas-section {
			height: 60vh;
			min-height: 300px;
		}

		.parameters-section {
			height: auto;
			max-height: 40vh;
		}

		header h1 {
			font-size: 1.5rem;
		}
	}
</style>
