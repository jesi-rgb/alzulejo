<script lang="ts">
	import { onMount } from "svelte";
	import { Polygon, Tessellation } from "@lib/core/geometry";
	import { Canvas } from "@lib/render/canvas.svelte";
	import type { Style } from "../lib/core/geometry/style.svelte";
	import { browser } from "$app/environment";

	interface AppSettings {
		mode: "polygon" | "tessellation";
		tessellationType: "triangle" | "square" | "hexagon";
		polygonSides: number;
		size: number;
		spacing: number;
		canvasWidth: number;
		canvasHeight: number;
	}

	const defaultSettings: AppSettings = {
		mode: "tessellation",
		tessellationType: "triangle",
		polygonSides: 3,
		size: 90,
		spacing: 0,
		canvasWidth: 1500,
		canvasHeight: 800,
	};

	let settings = $state<AppSettings>({ ...defaultSettings });
	let canvas = $state<Canvas>();
	let canvasElement: HTMLCanvasElement;

	const style: Style = {
		fill: "var(--accent)",
		fillOpacity: 0.9,
		stroke: "black",
		strokeWidth: 1.0,
		strokeOpacity: 1,
	};

	const polygon = new Polygon({
		sides: 3,
		radius: 30,
		centerX: defaultSettings.canvasWidth / 2,
		centerY: defaultSettings.canvasHeight / 2,
		style: style,
	});

	const tessellation = new Tessellation({
		type: "triangle",
		size: 90,
		width: defaultSettings.canvasWidth,
		height: defaultSettings.canvasHeight,
		spacing: 0,
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

		// Initialize with the current mode
		if (settings.mode === "polygon") {
			canvas.add(polygon);
		} else {
			canvas.add(tessellation);
		}
	}

	function setTessellationType(type: "triangle" | "square" | "hexagon") {
		tessellation.type = type;
		settings.tessellationType = type;
		saveSettings();
		updateVisualization();
	}

	function setPolygonSides(sides: number) {
		polygon.sides = sides;
		settings.polygonSides = sides;
		saveSettings();
		updateVisualization();
	}

	function switchMode(newMode: "polygon" | "tessellation") {
		if (!canvas) return;

		settings.mode = newMode;
		canvas.clearRenderables();

		if (newMode === "polygon") {
			canvas.add(polygon);
		} else {
			canvas.add(tessellation);
		}

		saveSettings();
	}

	function updateVisualization() {
		if (!canvas) return;

		canvas.clearRenderables();

		if (settings.mode === "polygon") {
			canvas.add(polygon);
		} else {
			canvas.add(tessellation);
		}
	}

	onMount(() => {
		settings = loadSettings();

		// Initialize reactive properties from settings
		tessellation.size = settings.size;
		tessellation.spacing = settings.spacing;
		tessellation.type = settings.tessellationType;
		tessellation.width = settings.canvasWidth;
		tessellation.height = settings.canvasHeight;

		polygon.sides = settings.polygonSides;
		polygon.radius = settings.size;
		polygon.centerX = settings.canvasWidth / 2;
		polygon.centerY = settings.canvasHeight / 2;

		canvas = new Canvas({
			width: settings.canvasWidth,
			height: settings.canvasHeight,
		});

		initializeCanvas();
	});
</script>

<div class="container">
	<header>
		<h1>Pattern Generator</h1>
	</header>

	<div class="canvas-container">
		<canvas
			bind:this={canvasElement}
			width={settings.canvasWidth}
			height={settings.canvasHeight}
		></canvas>
	</div>

	<div class="controls">
		<div class="control-section">
			<h3>Mode</h3>
			<div class="mode-selector">
				<button
					class="mode-btn {settings.mode === 'polygon'
						? 'active'
						: ''}"
					onclick={() => switchMode("polygon")}
				>
					Single Polygons
				</button>
				<button
					class="mode-btn {settings.mode === 'tessellation'
						? 'active'
						: ''}"
					onclick={() => switchMode("tessellation")}
				>
					Tessellations
				</button>
			</div>
		</div>

		{#if settings.mode === "polygon"}
			<div class="control-section">
				<h3>Polygon Type</h3>
				<div class="button-group">
					<button
						class="button {polygon.sides === 3 ? 'active' : ''}"
						onclick={() => setPolygonSides(3)}
					>
						Triangle
					</button>
					<button
						class="button {polygon.sides === 4 ? 'active' : ''}"
						onclick={() => setPolygonSides(4)}
					>
						Square
					</button>
					<button
						class="button {polygon.sides === 5 ? 'active' : ''}"
						onclick={() => setPolygonSides(5)}
					>
						Pentagon
					</button>
					<button
						class="button {polygon.sides === 6 ? 'active' : ''}"
						onclick={() => setPolygonSides(6)}
					>
						Hexagon
					</button>
					<button
						class="button {polygon.sides === 8 ? 'active' : ''}"
						onclick={() => setPolygonSides(8)}
					>
						Octagon
					</button>
				</div>

				<div class="slider-control">
					<label for="polygon-size">Size: {polygon.radius}</label>
					<input
						id="polygon-size"
						type="range"
						min="10"
						max="100"
						bind:value={polygon.radius}
						oninput={(e) => {
							polygon.radius = Number(e.target.value);
							updateVisualization();
						}}
					/>
				</div>

				{#if polygon}
					<div class="info">
						<p>
							<strong>Area:</strong>
							{polygon.area.toFixed(2)}
						</p>
						<p>
							<strong>Perimeter:</strong>
							{polygon.perimeter.toFixed(2)}
						</p>
						<p><strong>Sides:</strong> {polygon.sides}</p>
					</div>
				{/if}
			</div>
		{:else}
			<div class="control-section">
				<h3>Tessellation Type</h3>
				<div class="button-group">
					<button
						class="button {tessellation.type === 'triangle'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("triangle")}
					>
						Triangle Tiling
					</button>
					<button
						class="button {tessellation.type === 'square'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("square")}
					>
						Square Tiling
					</button>
					<button
						class="button {tessellation.type === 'hexagon'
							? 'active'
							: ''}"
						onclick={() => setTessellationType("hexagon")}
					>
						Hexagon Tiling
					</button>
				</div>

				<div class="slider-controls">
					<div class="slider-control">
						<label for="tessellation-size"
							>Size: {tessellation.size}</label
						>
						<input
							id="tessellation-size"
							type="range"
							min="5"
							max="80"
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
						{settings.canvasWidth} × {settings.canvasHeight}
					</p>
				</div>
			</div>
		{/if}

		<div class="control-section">
			<button
				class="reset-button"
				onclick={() => {
					settings = { ...defaultSettings };
					tessellation.size = defaultSettings.size;
					tessellation.spacing = defaultSettings.spacing;
					tessellation.type = defaultSettings.tessellationType;
					polygon.sides = defaultSettings.polygonSides;
					polygon.radius = defaultSettings.size;
					saveSettings();
				}}
			>
				Reset to Defaults
			</button>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
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
		margin-bottom: 30px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	canvas {
		object-fit: cover;
		display: block;
	}

	.controls {
		background: var(--bg-secondary, #f8f9fa);
		border-radius: 12px;
		padding: 25px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.control-section {
		font-family: "Roslindale Variable";
		margin-bottom: 25px;
	}

	.control-section:last-child {
		margin-bottom: 0;
	}

	.control-section h3 {
		font-family: "Roslindale Variable";
		margin: 0 0 15px 0;
		font-size: 1.2rem;
		color: var(--text-primary, #333);
		border-bottom: 2px solid var(--accent-color, #007acc);
		padding-bottom: 5px;
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
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 20px;
	}

	.button {
		padding: 10px 16px;
		border: 2px solid var(--border-color, #ddd);
		background: white;
		color: var(--text-primary, #333);
		cursor: pointer;
		border-radius: 6px;
		font-weight: 500;
		transition: all 0.2s ease;
		min-width: 100px;
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
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
		margin-bottom: 20px;
	}

	.slider-control {
		margin-bottom: 15px;
	}

	.slider-control label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
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
		padding: 15px;
		border-radius: 8px;
		border: 1px solid var(--border-color, #e0e0e0);
	}

	.info p {
		margin: 8px 0;
		font-family: "Courier New", monospace;
		font-size: 0.9rem;
		color: var(--text-secondary, #666);
	}

	.info p:first-child {
		margin-top: 0;
	}

	.info p:last-child {
		margin-bottom: 0;
	}

	.reset-button {
		padding: 12px 24px;
		background: var(--warning-color, #ff6b6b);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.reset-button:hover {
		background: var(--warning-color-dark, #ff5252);
		transform: translateY(-1px);
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
