import { Polygon } from './polygon.svelte';
import { Style } from './style.svelte';
import { Canvas } from '../../render/canvas.svelte';

type TessellationType = 'triangle' | 'square' | 'hexagon' | 'octagon-square';

interface TessellationConfig {
	type: TessellationType;
	size: number;
	width: number;
	height: number;
	spacing?: number;
	offset?: number;
	contactAngle?: number;
	style?: Style;
	style1?: Style;
	style2?: Style;
}

export class Tessellation {
	type = $state<TessellationType>('hexagon');
	size = $state(50);
	width = $state(800);
	height = $state(600);
	spacing = $state(0);
	offset = $state(0);
	contactAngle = $state(22.5);
	style = $state<Style>();
	style1 = $state<Style>();
	style2 = $state<Style>();

	constructor(config: TessellationConfig) {
		this.type = config.type;
		this.size = config.size;
		this.width = config.width;
		this.height = config.height;
		this.spacing = config.spacing ?? 0;
		this.offset = config.offset ?? 0;
		this.contactAngle = config.contactAngle ?? 22.5;
		this.style = config.style;
		this.style1 = config.style1;
		this.style2 = config.style2;
	}

	polygons: Polygon[] = $derived.by(() => {
		switch (this.type) {
			case 'triangle':
				return this.generateTriangleTessellation();
			case 'square':
				return this.generateSquareTessellation();
			case 'hexagon':
				return this.generateHexagonTessellation();
			case 'octagon-square':
				return this.generateOctagonSquareTessellation();
			default:
				return [];
		}
	});

	num_elements = $derived(this.polygons.length)

	private generateSquareTessellation(): Polygon[] {
		const polygons: Polygon[] = [];
		const stepX = this.size * 2 + this.spacing;
		const stepY = this.size + this.spacing;

		let rowIndex = 0, colIndex = 0;
		for (let y = 0; y < this.height + this.size; y += stepY) {
			const offsetX = rowIndex % 2 === 0 ? 0 : this.size + this.spacing * 0.5;
			colIndex = 0;
			for (let x = 0; x < this.width + this.size; x += stepX) {
				const polygon = Polygon.square(this.size, x + offsetX, y);
				polygon.contactAngle = this.contactAngle;
				if (this.style) polygon.style = this.style;
				polygons.push(polygon);
				colIndex++;
			}
			rowIndex++;
		}

		return polygons;
	}

	private generateTriangleTessellation(): Polygon[] {
		const polygons: Polygon[] = [];
		const sideLength = 2 * this.size * Math.sin(Math.PI / 3);

		const height = this.size * 3 * Math.sin(Math.PI / 6);
		const width = sideLength / 2;

		const spacingX = this.spacing;
		const spacingY = this.spacing * Math.sin(Math.PI / 3);

		let rowIndex = 0;
		let colIndex = 0;

		for (let y = 0; y < this.height + height; y += height + spacingY) {
			const offsetX = rowIndex % 2 === 0 ? this.offset : (sideLength + spacingY) * 0.5 + this.offset;
			colIndex = 0;
			for (let x = 0; x < this.width + width; x += width + spacingX) {
				const upward = colIndex % 2 === 0;
				let polygon;

				if (upward) {
					polygon = Polygon.triangle(this.size, x + offsetX, y - this.size * 0.5).rotate(Math.PI);
					polygon.contactAngle = this.contactAngle;
					if (this.style1) polygon.style = this.style1;
					else if (this.style) polygon.style = this.style;
				}
				else {
					polygon = Polygon.triangle(this.size, x + offsetX, y);
					polygon.contactAngle = this.contactAngle;
					if (this.style2) polygon.style = this.style2;
					else if (this.style) polygon.style = this.style;
				}

				polygons.push(polygon);
				colIndex++;
			}
			rowIndex++
		}

		return polygons
	}

	private generateHexagonTessellation(): Polygon[] {
		const polygons: Polygon[] = [];
		const width = this.size * Math.sqrt(3);
		const height = this.size * 1.5;

		let rowIndex = 0, colIndex = 0;

		for (let y = 0; y < this.height + height; y += height + this.spacing) {
			colIndex = 0;
			for (let x = 0; x < this.width + width; x += width + this.spacing) {
				const offsetX = rowIndex % 2 === 0 ? 0 : width * 0.5;
				const polygon = Polygon.hexagon(this.size, x + offsetX, y);
				polygon.contactAngle = this.contactAngle;
				polygons.push(polygon);
				colIndex++;
			}
			rowIndex++;
		}

		return polygons;
	}

	bounds = $derived(() => ({
		width: this.width,
		height: this.height,
		polygonCount: this.polygons.length
	}));

	draw(ctx: CanvasRenderingContext2D, showPolygons: boolean = true, showMidpoints: boolean = false, showRays: boolean = true): void {
		if (this.polygons.length === 0) return;

		if (showPolygons) {
			const styleGroups = this.groupPolygonsByStyle();

			for (const [, polygons] of styleGroups) {
				this.drawPolygonGroup(ctx, polygons);
			}
		}

		if (showMidpoints || showRays) {
			for (const polygon of this.polygons) {
				polygon.draw(ctx, showMidpoints, showRays, false);
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

		const stepX = octagonWidth + squareSize + this.spacing;
		const stepY = octagonApothem * 2 + squareSize + this.spacing;

		let rowIndex = 0;
		for (let y = 0; y < this.height + stepY; y += stepY) {
			let colIndex = 0;
			for (let x = 0; x < this.width + stepX; x += stepX) {
				const octagon = Polygon.octagon(octagonRadius, x + stepX / 2, y + stepY / 2).rotate(Math.PI / 8);
				octagon.contactAngle = this.contactAngle;
				if (this.style1) octagon.style = this.style1;
				else if (this.style) octagon.style = this.style;
				polygons.push(octagon);

				const octagon2 = Polygon.octagon(octagonRadius, x + stepX, y - stepY).rotate(Math.PI / 8);
				octagon2.contactAngle = this.contactAngle;
				if (this.style1) octagon.style = this.style1;
				else if (this.style) octagon.style = this.style;
				polygons.push(octagon2);

				const topSquare = Polygon.squareBySideLength(octagonSideLength, x + stepX / 2, y).rotate(Math.PI / 4);
				topSquare.contactAngle = this.contactAngle;
				if (this.style2) topSquare.style = this.style2;
				else if (this.style) topSquare.style = this.style;
				polygons.push(topSquare);

				const leftSquare = Polygon.squareBySideLength(octagonSideLength, x + stepX, y + stepY / 2).rotate(Math.PI / 4);
				leftSquare.contactAngle = this.contactAngle;
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
