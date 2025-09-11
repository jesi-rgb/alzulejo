import { Polygon } from './polygon.svelte';
import { Style } from './style.svelte';
import { Canvas } from '../../render/canvas.svelte';
import {
	TessellationPattern,
	PolygonFactory,
	HexagonPattern,
	TrianglePattern,
	SquarePattern,
	OctagonSquarePattern,
	RhombitrihexagonalPattern
} from './patterns';

type TessellationType = 'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal';

interface TessellationConfig {
	type: TessellationType;
	size: number;
	width: number;
	height: number;

	offset?: number;
	contactAngle?: number;
	style?: Style;
	style1?: Style;
	style2?: Style;
	motifColor?: string;
}

export class Tessellation {
	type = $state<TessellationType>("hexagon");
	size = $state(50);
	width = $state(800);
	height = $state(600);

	offset = $state(0);
	contactAngle = $state(22.5);
	motifColor = $state<string>('purple');
	style = $state<Style>();
	style1 = $state<Style>();
	style2 = $state<Style>();

	constructor(config: TessellationConfig) {
		this.type = config.type;
		this.size = config.size;
		this.width = config.width;
		this.height = config.height;

		this.offset = config.offset ?? 0;
		this.contactAngle = config.contactAngle ?? 22.5;
		this.motifColor = config.motifColor ?? 'purple';
		this.style = config.style;
		this.style1 = config.style1;
		this.style2 = config.style2;
	}

	polygons: Polygon[] = $derived.by(() => {
		const newSystemTypes = ['triangle', 'square', 'hexagon', 'octagon-square', 'rhombitrihexagonal'];
		if (newSystemTypes.includes(this.type)) {
			return this.generateFromPattern();
		}

		// Fallback for any remaining old system types
		return [];
	});

	num_elements = $derived(this.polygons.length)

	private generateFromPattern(): Polygon[] {
		const pattern = this.getPattern();
		if (!pattern) return [];

		const factory = new PolygonFactory(
			this.size,
			this.contactAngle,
			this.motifColor,
			this.style,
			this.style1,
			this.style2
		);

		const polygons: Polygon[] = [];
		const bounds = { width: this.width, height: this.height };

		for (const tilePosition of pattern.generatePositions(bounds)) {
			const polygon = factory.create(tilePosition, tilePosition.x, tilePosition.y);
			polygons.push(polygon);
		}

		console.log(polygons)
		return polygons;
	}

	private getPattern(): TessellationPattern | null {
		switch (this.type) {
			case 'hexagon':
				return new HexagonPattern(this.size);
			case 'triangle':
				return new TrianglePattern(this.size);
			case 'square':
				return new SquarePattern(this.size);
			case 'octagon-square':
				return new OctagonSquarePattern(this.size);
			case 'rhombitrihexagonal':
				return new RhombitrihexagonalPattern(this.size);
			default:
				return null;
		}
	}

	private generateRhombitrihexagonalTessellation(): Polygon[] {
		const polygons: Polygon[] = [];

		// For rhombitrihexagonal tiling, calculate edge length
		const edgeLength = this.size;

		// Pattern dimensions based on geometric constraints
		// In this tiling, the hexagon is regular and all edges have the same length
		const sqrt3 = Math.sqrt(3);
		const hexWidth = edgeLength
		const hexHeight = Polygon.hexagonBySideLength(edgeLength).apothem
		const triHeight = Polygon.triangleBySideLength(edgeLength).height

		const squareHeight = Polygon.squareBySideLength(edgeLength).apothem

		// The fundamental repeating unit
		const unitWidth = (squareHeight + hexWidth + triHeight) * 3;
		const unitHeight = (squareHeight + hexHeight) * 2

		for (let row = 0; row < Math.ceil(this.height / unitHeight) + 2; row++) {
			for (let col = 0; col < Math.ceil(this.width / unitWidth) + 2; col++) {
				const baseX = col * unitWidth;
				const baseY = row * unitHeight;

				// Create hexagons at regular grid positions
				const hexagon = Polygon.hexagonBySideLength(edgeLength, baseX, baseY).rotate(Math.PI / 6);
				hexagon.contactAngle = this.contactAngle;
				hexagon.motifColor = this.motifColor;
				if (this.style) hexagon.style = this.style;
				polygons.push(hexagon);


				const leftTriangle = Polygon.triangleBySideLength(
					edgeLength,
					edgeLength + triHeight, baseY)
					.rotate(-Math.PI / 2);
				leftTriangle.contactAngle = this.contactAngle;
				leftTriangle.motifColor = this.motifColor;
				if (this.style2) leftTriangle.style = this.style2;
				else if (this.style) leftTriangle.style = this.style;
				polygons.push(leftTriangle);

			}
		}

		return polygons;
	}

	bounds = $derived(() => ({
		width: this.width,
		height: this.height,
		polygonCount: this.polygons.length
	}));

	draw(ctx: CanvasRenderingContext2D, showPolygons: boolean = true,
		showMidpoints: boolean = false,
		showRays: boolean = false, showMotif: boolean = true, showIntersectionPoints: boolean = false): void {
		if (this.polygons.length === 0) return;

		if (showPolygons) {
			const styleGroups = this.groupPolygonsByStyle();

			for (const [, polygons] of styleGroups) {
				this.drawPolygonGroup(ctx, polygons);
			}
		}

		if (showMidpoints || showRays || showMotif || showIntersectionPoints) {
			for (const polygon of this.polygons) {
				polygon.draw(ctx, showMidpoints, showRays, false, showMotif, showIntersectionPoints);
			}
		}
	}

	_draw(ctx: CanvasRenderingContext2D): void {
		if (this.polygons.length === 0) return;
		this.polygons.forEach(polygon => polygon.draw(ctx));
	}


	private generateOctagonSquareTessellation(): Polygon[] {
		const polygons: Polygon[] = [];

		// For 4.8.8 tiling: each vertex has square + octagon + octagon
		// Regular octagon inscribed radius to edge length ratio is 1 / (2 * tan(π/8))
		// For proper fit: octagon_radius = square_size / (1 + sqrt(2))
		const octagonRadius = this.size;
		const octagonSideLength = Polygon.regular(8, this.size).edges[0].magnitude;
		const squareSize = octagonSideLength;

		// Calculate spacing between pattern units
		const octagonWidth = octagonRadius * 2 * Math.cos(Math.PI / 8);
		const octagonApothem = Polygon.octagon(octagonRadius).apothem;

		const stepX = octagonWidth + squareSize;
		const stepY = octagonApothem * 2 + squareSize;

		let rowIndex = 0;
		for (let y = -stepY; y < this.height + stepY; y += stepY) {
			let colIndex = 0;
			for (let x = -stepX; x < this.width + stepX; x += stepX) {
				const octagon = Polygon.octagon(octagonRadius, x + stepX / 2, y + stepY / 2).rotate(Math.PI / 8);
				octagon.contactAngle = this.contactAngle;
				octagon.motifColor = this.motifColor;
				if (this.style1) octagon.style = this.style1;
				else if (this.style) octagon.style = this.style;
				polygons.push(octagon);

				const octagon2 = Polygon.octagon(octagonRadius, x + stepX, y - stepY).rotate(Math.PI / 8);
				octagon2.contactAngle = this.contactAngle;
				octagon2.motifColor = this.motifColor;
				if (this.style1) octagon2.style = this.style1;
				else if (this.style) octagon2.style = this.style;
				polygons.push(octagon2);

				const topSquare = Polygon.squareBySideLength(octagonSideLength, x + stepX / 2, y).rotate(Math.PI / 4);
				topSquare.contactAngle = this.contactAngle;
				topSquare.motifColor = this.motifColor;
				if (this.style2) topSquare.style = this.style2;
				else if (this.style) topSquare.style = this.style;
				polygons.push(topSquare);

				const leftSquare = Polygon.squareBySideLength(octagonSideLength, x + stepX, y + stepY / 2).rotate(Math.PI / 4);
				leftSquare.contactAngle = this.contactAngle;
				leftSquare.motifColor = this.motifColor;
				if (this.style2) leftSquare.style = this.style2;
				else if (this.style) leftSquare.style = this.style;
				polygons.push(leftSquare);

				colIndex++;
			}
			rowIndex++;
		}

		return polygons;
	}

	private groupPolygonsByStyle(): Map<string, Polygon[]> {
		const groups = new Map<string, Polygon[]>();

		for (const polygon of this.polygons) {
			const key = this.getStyleKey(polygon.style);

			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(polygon);
		}

		return groups;
	}

	private getStyleKey(style?: Style): string {
		if (!style) return 'default';

		return `${style.fill}-${style.fillOpacity}-${style.stroke}-${style.strokeWidth}-${style.strokeOpacity}`;
	}

	private drawPolygonGroup(ctx: CanvasRenderingContext2D, polygons: Polygon[]): void {
		if (polygons.length === 0) return;

		const batchPath = new Path2D();

		for (const polygon of polygons) {
			if (polygon.vertices.length < 2) continue;

			batchPath.moveTo(polygon.vertices[0].x, polygon.vertices[0].y);
			for (let i = 1; i < polygon.vertices.length; i++) {
				batchPath.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
			}
			batchPath.closePath();
		}

		const firstPolygon = polygons[0];
		const fillColor = firstPolygon.style?.fill ?? 'aquamarine';
		const strokeColor = firstPolygon.style?.stroke ?? 'white';
		const fillOpacity = firstPolygon.style?.fillOpacity ?? 1;
		const strokeOpacity = firstPolygon.style?.strokeOpacity ?? 1;

		ctx.fillStyle = Canvas.applyOpacity(Canvas.computeColor(fillColor), fillOpacity, ctx);
		ctx.strokeStyle = Canvas.applyOpacity(Canvas.computeColor(strokeColor), strokeOpacity, ctx);
		ctx.lineWidth = firstPolygon.style?.strokeWidth ?? 1;

		ctx.fill(batchPath);
		ctx.stroke(batchPath);
	}


}
