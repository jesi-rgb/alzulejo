import { Polygon } from './polygon.svelte';
import { Style } from './style.svelte';

type TessellationType = 'triangle' | 'square' | 'hexagon';

interface TessellationConfig {
	type: TessellationType;
	size: number;
	width: number;
	height: number;
	spacing?: number;
	style?: Style;
}

export class Tessellation {
	type = $state<TessellationType>('hexagon');
	size = $state(50);
	width = $state(800);
	height = $state(600);
	spacing = $state(0);
	style = $state<Style>();

	constructor(config: TessellationConfig) {
		this.type = config.type;
		this.size = config.size;
		this.width = config.width;
		this.height = config.height;
		this.spacing = config.spacing ?? 0;
		this.style = config.style;
	}

	polygons = $derived.by(() => {
		switch (this.type) {
			case 'triangle':
				return this.generateTriangleTessellation();
			case 'square':
				return this.generateSquareTessellation();
			case 'hexagon':
				return this.generateHexagonTessellation();
			default:
				return [];
		}
	});

	private generateSquareTessellation(): Polygon[] {
		const polygons: Polygon[] = [];
		const step = this.size * 2 + this.spacing;

		for (let x = this.size; x < this.width; x += step) {
			for (let y = this.size; y < this.height; y += step) {
				const polygon = Polygon.square(this.size, x, y);
				if (this.style) polygon.style = this.style;
				polygons.push(polygon);
			}
		}

		return polygons;
	}

	private generateTriangleTessellation(): Polygon[] {
		const polygons: Polygon[] = [];
		const height = this.size * 3 * Math.sin(Math.PI / 6);
		const width = this.size * Math.sqrt(3) / 2;

		const style1 = new Style('red', 0.8, 'darkred', 2, 1);
		const style2 = new Style('blue', 0.8, 'darkblue', 2, 1);

		let rowIndex = 0;
		let colIndex = 0;
		for (let x = 0; x < this.width + width; x += width + this.spacing) {
			for (let y = 0; y < this.height + height; y += height + this.spacing) {
				const upward = colIndex % 2 === 0;
				let polygon;

				if (upward) {
					polygon = Polygon.triangle(this.size, x, y - this.size * 0.5).rotate(Math.PI);
					polygon.style = style1;
				}
				else {
					polygon = Polygon.triangle(this.size, x, y);
					polygon.style = style2;
				}

				polygons.push(polygon);
				rowIndex++;
			}
			colIndex++
		}



		// for (let y = this.size; y < this.height; y += height) {
		// 	const offsetX = (rowIndex % 2) * (width * 0.5);
		//
		// 	for (let x = this.size + offsetX; x < this.width; x += width) {
		// 		const upward = (rowIndex + Math.floor((x - offsetX) / width)) % 2 === 0;
		// 		const offsetY = upward ? 0 : height * 0.5;
		// 		const polygon = Polygon.triangle(this.size, x, y);
		//
		// 		if (!upward) {
		// 			polygon.rotate(Math.PI);
		// 		}
		//
		// 		if (this.style) polygon.style = this.style;
		// 		polygons.push(polygon);
		// 	}
		// 	rowIndex++;
		// }

		return polygons;
	}

	private generateHexagonTessellation(): Polygon[] {
		const polygons: Polygon[] = [];
		const hexWidth = this.size * 2 + this.spacing;
		const hexHeight = this.size * Math.sqrt(3) + this.spacing;

		let rowIndex = 0;
		for (let y = this.size; y < this.height; y += hexHeight * 0.75) {
			const offsetX = (rowIndex % 2) * (hexWidth * 0.5);

			for (let x = this.size + offsetX; x < this.width; x += hexWidth) {
				const polygon = Polygon.hexagon(this.size, x, y);

				if (this.style) polygon.style = this.style;
				polygons.push(polygon);
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

	draw(ctx: CanvasRenderingContext2D): void {
		if (this.polygons.length === 0) return;

		const styleGroups = this.groupPolygonsByStyle();

		for (const [, polygons] of styleGroups) {
			this.drawPolygonGroup(ctx, polygons);
		}
	}

	_draw(ctx: CanvasRenderingContext2D): void {
		if (this.polygons.length === 0) return;
		this.polygons.forEach(polygon => polygon.draw(ctx));
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

		ctx.fillStyle = this.applyOpacity(this.computeColor(fillColor), fillOpacity);
		ctx.strokeStyle = this.applyOpacity(this.computeColor(strokeColor), strokeOpacity);
		ctx.lineWidth = firstPolygon.style?.strokeWidth ?? 1;

		ctx.fill(batchPath);
		ctx.stroke(batchPath);
	}

	private computeColor(color: string): string {
		if (color.startsWith('var(') && color.endsWith(')')) {
			const varName = color.slice(4, -1);
			return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || color;
		}
		return color;
	}

	private applyOpacity(color: string, opacity: number): string {
		if (opacity === 1) return color;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		ctx.fillStyle = color;
		const computedColor = ctx.fillStyle;

		if (computedColor.startsWith('#')) {
			const hex = computedColor.slice(1);
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		} else if (computedColor.startsWith('rgb(')) {
			const rgb = computedColor.slice(4, -1);
			return `rgba(${rgb}, ${opacity})`;
		}

		return color;
	}
}
