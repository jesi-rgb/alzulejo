import { Point } from './point.svelte';

interface PolygonConfig {
	sides: number;
	radius?: number;
	centerX?: number;
	centerY?: number;
}

export class Polygon {
	vertices = $state<Point[]>([]);

	constructor(verticesOrConfig: Point[] | PolygonConfig) {
		if (Array.isArray(verticesOrConfig)) {
			this.vertices = verticesOrConfig;
		} else {
			const { sides, radius = 50, centerX = 0, centerY = 0 } = verticesOrConfig;
			this.vertices = this.generateRegularVertices(sides, radius, centerX, centerY);
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

	center = $derived(() => {
		if (this.vertices.length === 0) return new Point(0, 0);

		const sumX = this.vertices.reduce((sum, vertex) => sum + vertex.x, 0);
		const sumY = this.vertices.reduce((sum, vertex) => sum + vertex.y, 0);
		return new Point(sumX / this.vertices.length, sumY / this.vertices.length);
	});

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
		ctx.stroke();
	}
}
