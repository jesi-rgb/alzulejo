<script lang="ts">
	import { onMount } from "svelte";
	import { Tessellation } from "@lib/core/geometry";
	import { Canvas } from "@lib/render/canvas.svelte";
	import type { Style } from "../lib/core/geometry/style.svelte";
	import { browser } from "$app/environment";

	interface AppSettings {
		tessellationType:
			| "triangle"
			| "square"
			| "hexagon"
			| "octagon-square"
			| "rhombitrihexagonal";
		size: number;

		contactAngle: number;
		motifColor: string;
		showPolygons: boolean;
		showMidpoints: boolean;
		showRays: boolean;
		showRayPairs: boolean;
		showIntersectionPoints: boolean;
	}

	const defaultSettings: AppSettings = {
		tessellationType: "rhombitrihexagonal",
		size: 160,
		contactAngle: 45.1,
		motifColor: "var(--primary)",
		showPolygons: true,
		showMidpoints: true,
		showRays: false,
		showRayPairs: false,
		showIntersectionPoints: false,
	};

	let settings = $state<AppSettings>({ ...defaultSettings });
	let canvas = $state<Canvas>();
	let canvasElement: HTMLCanvasElement;
	let resizeObserver: ResizeObserver;

	const style: Style = {
		fill: "var(--base-200)",
		fillOpacity: 0.9,
		stroke: "var(--accent)",
		strokeWidth: 2.0,
		strokeOpacity: 1,
		motifColor: "var(--primary)",
	};

	const tessellation = new Tessellation({
		type: "triangle",
		size: 190,
		width: 400,
		height: 300,
		contactAngle: 22.5,
		style: style,
	});

	function loadSettings(): AppSettings {
		if (!browser) return { ...defaultSettings };

		try {
			const stored = localStorage.getItem("pattern-gen-settings");
			if (stored) {
				const parsed = JSON.parse(stored);
				return { ...defaultSettings, ...parsed };
			}
		} catch (error) {
			console.warn("Failed to load settings from localStorage:", error);
		}
		return { ...defaultSettings };
	}

	function saveSettings() {
		if (!browser) return;

		try {
			localStorage.setItem(
				"pattern-gen-settings",
				JSON.stringify(settings),
			);
		} catch (error) {
			console.warn("Failed to save settings to localStorage:", error);
		}
	}

	function initializeCanvas() {
		if (!canvas || !canvasElement) return;

		canvas.setup(canvasElement);
		updateTessellationSize();

		canvas.add(
			tessellation,
			settings.showPolygons,
			settings.showMidpoints,
			settings.showRays,
			settings.showRayPairs,
			settings.showIntersectionPoints,
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
		// saveSettings();
		updateVisualization();
	}

	function updateVisualization() {
		if (!canvas) return;

		canvas.clearRenderables();
		canvas.add(
			tessellation,
			settings.showPolygons,
			settings.showMidpoints,
			settings.showRays,
			settings.showRayPairs,
			settings.showIntersectionPoints,
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
							max="90"
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

			<div class="control-section">
				<h3 class="text-accent">Visibility</h3>
				<div class="checkbox-group">
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showPolygons}
							onchange={() => {
								saveSettings();
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
								saveSettings();
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
								saveSettings();
								updateVisualization();
							}}
						/>
						Show Rays
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showRayPairs}
							onchange={() => {
								saveSettings();
								updateVisualization();
							}}
						/>
						Show Motif
					</label>
					<label class="checkbox-control">
						<input
							type="checkbox"
							bind:checked={settings.showIntersectionPoints}
							onchange={() => {
								saveSettings();
								updateVisualization();
							}}
						/>
						Show Intersection Points
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
		height: 8px;
		border-radius: 4px;
		background: var(--base-300);
		outline: none;
		-webkit-appearance: none;
	}

	.slider-control input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
		border: 2px solid var(--accent-content);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.slider-control input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
		border: 2px solid var(--accent-content);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
