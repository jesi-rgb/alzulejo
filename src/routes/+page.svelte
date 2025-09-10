<script lang="ts">
	import { onMount } from "svelte";
	import { Tessellation } from "@lib/core/geometry";
	import { Canvas } from "@lib/render/canvas.svelte";
	import type { Style } from "../lib/core/geometry/style.svelte";
	import { browser } from "$app/environment";

	interface AppSettings {
		tessellationType: "triangle" | "square" | "hexagon" | "octagon-square";
		size: number;
		spacing: number;
		contactAngle: number;
		showPolygons: boolean;
		showMidpoints: boolean;
		showRays: boolean;
		showRayPairs: boolean;
	}

	const defaultSettings: AppSettings = {
		tessellationType: "triangle",
		size: 190,
		spacing: 0,
		contactAngle: 22.5,
		showPolygons: true,
		showMidpoints: false,
		showRays: true,
		showRayPairs: false,
	};

	let settings = $state<AppSettings>({ ...defaultSettings });
	let canvas = $state<Canvas>();
	let canvasElement: HTMLCanvasElement;
	let resizeObserver: ResizeObserver;

	const style: Style = {
		fill: "var(--accent)",
		fillOpacity: 0.9,
		stroke: "black",
		strokeWidth: 1.0,
		strokeOpacity: 1,
	};

	const tessellation = new Tessellation({
		type: "triangle",
		size: 190,
		width: 400,
		height: 300,
		spacing: 0,
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
		type: "triangle" | "square" | "hexagon" | "octagon-square",
	) {
		tessellation.type = type;
		settings.tessellationType = type;
		saveSettings();
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
		);
	}

	onMount(() => {
		settings = loadSettings();

		tessellation.size = settings.size;
		tessellation.spacing = settings.spacing;
		tessellation.contactAngle = settings.contactAngle;
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

<div class="container">
	<header>
		<h1>Pattern Generator</h1>
	</header>

	<div class="main-content">
		<div class="canvas-container">
			<canvas bind:this={canvasElement}></canvas>
		</div>

		<div class="controls">
			<div class="control-section">
				<h3>Tessellation Type</h3>
				<div class="button-group">
					<button
						class="button {tessellation.type === 'triangle'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("triangle")}
					>
						Triangle
					</button>
					<button
						class="button {tessellation.type === 'square'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("square")}
					>
						Square
					</button>
					<button
						class="button {tessellation.type === 'hexagon'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("hexagon")}
					>
						Hexagon
					</button>
					<button
						class="button {tessellation.type === 'octagon-square'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("octagon-square")}
					>
						Octagon-Square
					</button>
				</div>
			</div>

			<div class="control-section">
				<h3>Parameters</h3>
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
						<label for="tessellation-spacing"
							>Spacing: {tessellation.spacing}</label
						>
						<input
							id="tessellation-spacing"
							type="range"
							min="0"
							max="80"
							bind:value={tessellation.spacing}
							oninput={(e) => {
								tessellation.spacing = Number(e.target.value);
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
				<h3>Visibility</h3>
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
				</div>
			</div>

			<div class="info">
				<p>
					<strong>Polygons:</strong>
					{tessellation.num_elements}
				</p>
				<p>
					<strong>Type:</strong>
					{tessellation.type} tessellation
				</p>
				<p>
					<strong>Canvas:</strong>
					{Math.round(tessellation.width)} × {Math.round(
						tessellation.height,
					)}
				</p>
			</div>

			<div class="control-section">
				<button
					class="reset-button"
					onclick={() => {
						settings = { ...defaultSettings };
						tessellation.size = defaultSettings.size;
						tessellation.spacing = defaultSettings.spacing;
						tessellation.contactAngle =
							defaultSettings.contactAngle;
						tessellation.type = defaultSettings.tessellationType;
						saveSettings();
						updateVisualization();
					}}
				>
					Reset to Defaults
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		margin: 0 auto;
		padding: 20px;
	}

	.main-content {
		display: flex;
		gap: 15px;
		align-items: flex-start;
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 30px;
		font-family: "Roslindale Variable";
	}

	header h1 {
		margin: 0 0 10px 0;
		font-size: 1.5rem;
		color: var(--text-primary, #333);
	}

	.canvas-container {
		display: flex;
		border: 2px dashed var(--primary);
		justify-content: center;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		aspect-ratio: 1/0.77;
		flex-grow: 1;
	}

	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}

	.controls {
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		width: 280px;
		flex-shrink: 0;
		font-size: 0.8rem;
		overflow-y: auto;
		height: fit-content;
		max-height: 100%;
	}

	.control-section {
		font-family: "Roslindale Variable";
		margin-bottom: 15px;
	}

	.control-section:last-child {
		margin-bottom: 0;
	}

	.control-section h3 {
		font-family: "Roslindale Variable";
		margin: 0 0 8px 0;
		font-size: 0.95rem;
		color: var(--text-primary, #333);
		border-bottom: 1px solid var(--accent-color, #007acc);
		padding-bottom: 3px;
		display: inline-block;
	}

	.mode-selector {
		display: flex;
		gap: 10px;
		margin-bottom: 15px;
	}

	.mode-btn {
		padding: 12px 20px;
		border: 2px solid var(--border-color, #ddd);
		background: white;
		color: var(--text-primary, #333);
		cursor: pointer;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.mode-btn:hover {
		background: var(--bg-hover, #f0f0f0);
		border-color: var(--accent-color, #007acc);
	}

	.mode-btn.active {
		border-color: var(--accent-color, #007acc);
		background: var(--accent-color, #007acc);
		color: white;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 10px;
	}

	.button {
		padding: 6px 8px;
		border: 1px solid var(--border-color, #ddd);
		background: white;
		color: var(--text-primary, #333);
		cursor: pointer;
		border-radius: 4px;
		font-weight: 400;
		font-size: 0.75rem;
		transition: all 0.2s ease;
		text-align: left;
	}

	.button:hover {
		background: var(--bg-hover, #f0f0f0);
		border-color: var(--accent-color, #007acc);
	}

	.button.active {
		border-color: var(--accent-color, #007acc);
		background: var(--accent-color, #007acc);
		color: white;
	}

	.slider-controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 10px;
	}

	.slider-control {
		margin-bottom: 0;
	}

	.slider-control label {
		display: block;
		margin-bottom: 4px;
		font-weight: 500;
		font-size: 0.75rem;
		color: var(--text-primary, #333);
	}

	.slider-control input[type="range"] {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: var(--border-color, #ddd);
		outline: none;
		-webkit-appearance: none;
	}

	.slider-control input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--accent-color, #007acc);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.slider-control input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--accent-color, #007acc);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.info {
		background: white;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid var(--border-color, #e0e0e0);
	}

	.info p {
		margin: 3px 0;
		font-family: "Courier New", monospace;
		font-size: 0.65rem;
		color: var(--text-secondary, #666);
	}

	.info p:first-child {
		margin-top: 0;
	}

	.info p:last-child {
		margin-bottom: 0;
	}

	.reset-button {
		padding: 6px 12px;
		background: var(--warning-color, #ff6b6b);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 400;
		font-size: 0.75rem;
		transition: all 0.2s ease;
		width: 100%;
	}

	.reset-button:hover {
		background: var(--warning-color-dark, #ff5252);
		transform: translateY(-1px);
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.checkbox-control {
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 400;
		font-size: 0.75rem;
		color: var(--text-primary, #333);
		cursor: pointer;
	}

	.checkbox-control input[type="checkbox"] {
		width: 14px;
		height: 14px;
		accent-color: var(--accent-color, #007acc);
		cursor: pointer;
	}

	@media (max-width: 1024px) {
		.main-content {
			flex-direction: column;
		}

		.controls {
			min-width: unset;
		}
	}

	@media (max-width: 768px) {
		.container {
			padding: 15px;
		}

		header h1 {
			font-size: 2rem;
		}

		.button-group {
			justify-content: center;
		}

		.slider-controls {
			grid-template-columns: 1fr;
		}

		canvas {
			max-width: 100%;
			height: auto;
		}
	}
</style>
