import type { Style } from './style.svelte';
import { Point } from './point.svelte';

interface PolygonConfig {
	sides: number;
	radius?: number;
	centerX?: number;
	centerY?: number;
	style?: Style;
}

export class Polygon {
	vertices = $state<Point[]>([]);
	style = $state<Style>();

	constructor(verticesOrConfig: Point[] | PolygonConfig) {
		if (Array.isArray(verticesOrConfig)) {
			this.vertices = verticesOrConfig;
		} else {
			const { sides, radius = 50, centerX = 0, centerY = 0 } = verticesOrConfig;
			this.vertices = this.generateRegularVertices(sides, radius, centerX, centerY);
			this.style = verticesOrConfig.style;
		}
	}

	private generateRegularVertices(sides: number, radius: number, centerX: number, centerY: number): Point[] {
		const vertices: Point[] = [];
		const angleStep = (2 * Math.PI) / sides;

		for (let i = 0; i < sides; i++) {
			const angle = i * angleStep - Math.PI / 2; // Start from top
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			vertices.push(new Point(x, y));
		}

		return vertices;
	}

	static regular(sides: number, radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		const vertices: Point[] = [];
		const angleStep = (2 * Math.PI) / sides;

		for (let i = 0; i < sides; i++) {
			const angle = i * angleStep - Math.PI / 2; // Start from top
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			vertices.push(new Point(x, y));
		}

		return new Polygon(vertices);
	}

	static triangle(radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regular(3, radius, centerX, centerY);
	}

	static square(radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regular(4, radius, centerX, centerY);
	}

	static pentagon(radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regular(5, radius, centerX, centerY);
	}

	static hexagon(radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regular(6, radius, centerX, centerY);
	}

	area = $derived.by(() => {
		if (this.vertices.length < 3) return 0;

		let area = 0;
		for (let i = 0; i < this.vertices.length; i++) {
			const j = (i + 1) % this.vertices.length;
			area += this.vertices[i].x * this.vertices[j].y;
			area -= this.vertices[j].x * this.vertices[i].y;
		}
		return Math.abs(area) / 2;
	});

	perimeter = $derived.by(() => {
		if (this.vertices.length < 2) return 0;

		let perimeter = 0;
		for (let i = 0; i < this.vertices.length; i++) {
			const j = (i + 1) % this.vertices.length;
			const dx = this.vertices[j].x - this.vertices[i].x;
			const dy = this.vertices[j].y - this.vertices[i].y;
			perimeter += Math.sqrt(dx * dx + dy * dy);
		}
		return perimeter;
	});

	center = $derived.by(() => {
		if (this.vertices.length === 0) return new Point(0, 0);

		const sumX = this.vertices.reduce((sum, vertex) => sum + vertex.x, 0);
		const sumY = this.vertices.reduce((sum, vertex) => sum + vertex.y, 0);
		return new Point(sumX / this.vertices.length, sumY / this.vertices.length);
	});

	rotate(angle: number): Polygon {
		const centerPoint = this.center;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		this.vertices.forEach(vertex => {
			const dx = vertex.x - centerPoint.x;
			const dy = vertex.y - centerPoint.y;

			vertex.x = centerPoint.x + dx * cos - dy * sin;
			vertex.y = centerPoint.y + dx * sin + dy * cos;
		});

		const polygon = new Polygon(this.vertices);
		polygon.style = this.style;
		return polygon
	}

	contains(point: Point): boolean {
		let inside = false;
		for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
			if (((this.vertices[i].y > point.y) !== (this.vertices[j].y > point.y)) &&
				(point.x < (this.vertices[j].x - this.vertices[i].x) * (point.y - this.vertices[i].y) /
					(this.vertices[j].y - this.vertices[i].y) + this.vertices[i].x)) {
				inside = !inside;
			}
		}
		return inside;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		if (this.vertices.length < 2) return;

		ctx.beginPath();
		ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
		for (let i = 1; i < this.vertices.length; i++) {
			ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
		}
		ctx.closePath();

		this.color(ctx)
	}

	color(ctx: CanvasRenderingContext2D): void {
		const fillColor = this.style?.fill ?? 'aquamarine';
		const strokeColor = this.style?.stroke ?? 'white';
		const fillOpacity = this.style?.fillOpacity ?? 1;
		const strokeOpacity = this.style?.strokeOpacity ?? 1;

		ctx.fillStyle = this.applyOpacity(this.computeColor(fillColor), fillOpacity);
		ctx.strokeStyle = this.applyOpacity(this.computeColor(strokeColor), strokeOpacity);
		ctx.lineWidth = this.style?.strokeWidth ?? 1;
		ctx.fill()
		ctx.stroke()
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
