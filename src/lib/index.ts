export { Canvas } from './render/canvas.svelte';
export type { CanvasConfig } from './render/canvas.svelte';

export { Tessellation } from './core/geometry/tessellation.svelte';

export { Polygon } from './core/geometry/polygon.svelte';
export { Point, Edge, Ray } from './core/geometry/point.svelte';

export type { Style } from './core/geometry/style.svelte';

export {
	TessellationPattern,
	PolygonFactory,
	HexagonPattern,
	TrianglePattern,
	SquarePattern,
	OctagonSquarePattern,
	RhombitrihexagonalPattern
} from './core/geometry/patterns';

export type { TilePosition } from './core/geometry/patterns/types';

export { default as PatternCanvas } from './PatternCanvas.svelte';
