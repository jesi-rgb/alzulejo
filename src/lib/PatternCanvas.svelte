<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '$lib/render/canvas.svelte';
	import { Tessellation } from '$lib/core/geometry/tessellation.svelte';
	import type { Style } from '$lib/core/geometry/style.svelte';

	interface PatternCanvasProps {
		type?: 'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal' | 'snub-square';
		size?: number;
		width?: number;
		height?: number;
		contactAngle?: number;
		backgroundColor?: string;
		showPolygons?: boolean;
		showMidpoints?: boolean;
		showRays?: boolean;
		showMotif?: boolean;
		showMotifFilled?: boolean;
		showIntersectionPoints?: boolean;
		style?: Style;
		style1?: Style;
		style2?: Style;
		style3?: Style;
		class?: string;
	}

	let {
		type = 'hexagon',
		size = 100,
		width = 800,
		height = 600,
		contactAngle = 22.5,
		backgroundColor = '#f5f5dc',
		showPolygons = false,
		showMidpoints = false,
		showRays = false,
		showMotif = false,
		showMotifFilled = true,
		showIntersectionPoints = false,
		style,
		style1,
		style2,
		style3,
		class: className = ''
	}: PatternCanvasProps = $props();

	let canvasElement: HTMLCanvasElement;
	let canvas: Canvas;
	let resizeObserver: ResizeObserver;

	const tessellation = new Tessellation({
		type,
		size,
		width,
		height,
		contactAngle,
		backgroundColor,
		style,
		style1,
		style2,
		style3
	});

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

	function updateVisualization() {
		if (!canvas) return;
		canvas.clearRenderables();
		canvas.add(
			tessellation,
			showPolygons,
			showMidpoints,
			showRays,
			showMotif,
			showMotifFilled,
			showIntersectionPoints
		);
	}

	$effect(() => {
		tessellation.type = type;
		tessellation.size = size;
		tessellation.contactAngle = contactAngle;
		tessellation.backgroundColor = backgroundColor;
		if (style) tessellation.style = style;
		if (style1) tessellation.style1 = style1;
		if (style2) tessellation.style2 = style2;
		if (style3) tessellation.style3 = style3;
		updateVisualization();
	});

	onMount(() => {
		canvas = new Canvas();
		canvas.setup(canvasElement);
		updateTessellationSize();
		canvas.add(
			tessellation,
			showPolygons,
			showMidpoints,
			showRays,
			showMotif,
			showMotifFilled,
			showIntersectionPoints
		);

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

<canvas bind:this={canvasElement} class={className}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
