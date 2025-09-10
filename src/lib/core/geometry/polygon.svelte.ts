import type { Style } from './style.svelte';
import { Point, Edge, Ray } from './point.svelte';
import { Canvas } from '../../render/canvas.svelte';


interface PolygonConfig {
	sides: number;
	radius?: number;
	centerX?: number;
	centerY?: number;
	style?: Style;
	motifColor?: string;
}

interface RayPair {
	ray1: Ray;
	ray2: Ray;
	totalLength: number;
	intersectionPoint: Point;
	clippedRay1: Ray; // A to P
	clippedRay2: Ray; // P to D
}

export class Polygon {
	style = $state<Style>();
	sides = $state<number>(3);
	radius = $state<number>(50);
	centerX = $state<number>(0);
	contactAngle = $state<number>(22.5);
	centerY = $state<number>(0);
	motifColor = $state<string>('purple');
	_manualVertices = $state<Point[] | null>(null);

	vertices = $derived.by(() => {
		if (this._manualVertices) {
			return this._manualVertices;
		}
		if (this.sides && this.radius !== undefined && this.centerX !== undefined && this.centerY !== undefined) {
			return this.generateRegularVertices(this.sides, this.radius, this.centerX, this.centerY);
		}
		return [];
	});

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

	edges = $derived.by(() => {
		if (this.vertices.length < 2) return [];

		const edges: Edge[] = [];
		for (let i = 0; i < this.vertices.length; i++) {
			const j = (i + 1) % this.vertices.length;
			edges.push(new Edge(this.vertices[i], this.vertices[j]));
		}

		return edges;
	});

	midpoints = $derived.by(() => {
		if (this.edges.length < 0) return [];

		const midpoints: Point[] = [];
		for (let i = 0; i < this.edges.length; i++) {
			midpoints.push(this.edges[i].midpoint);
		}
		return midpoints;
	});

	apothem = $derived.by(() => {
		return new Edge(this.center, this.edges[0].midpoint).magnitude;
	});

	rays = $derived.by(() => {
		if (this.edges.length < 2) return [];

		const rays: Ray[] = [];
		const contactAngleRad = (this.contactAngle * Math.PI) / 180;

		for (let i = 0; i < this.edges.length; i++) {
			const edge = this.edges[i];
			const midpoint = edge.midpoint;
			const edgeAngle = edge.angle;

			const ray1Angle = edgeAngle + Math.PI / 2 + contactAngleRad;
			const ray2Angle = edgeAngle + Math.PI / 2 - contactAngleRad;

			const ray1 = new Ray(midpoint, ray1Angle, 200);
			ray1.edgeIndex = i;
			const ray2 = new Ray(midpoint, ray2Angle, 200);
			ray2.edgeIndex = i;

			let shortestIntersection1: Point | null = null;
			let shortestDistance1 = Infinity;
			let shortestIntersection2: Point | null = null;
			let shortestDistance2 = Infinity;

			for (let j = 0; j < this.edges.length; j++) {
				if (j === i) continue;

				const targetEdge = this.edges[j];

				const intersection1 = ray1.intersect(targetEdge);
				if (intersection1) {
					const dist = Math.sqrt(
						Math.pow(intersection1.x - midpoint.x, 2) +
						Math.pow(intersection1.y - midpoint.y, 2)
					);
					if (dist < shortestDistance1) {
						shortestDistance1 = dist;
						shortestIntersection1 = intersection1;
					}
				}

				const intersection2 = ray2.intersect(targetEdge);
				if (intersection2) {
					const dist = Math.sqrt(
						Math.pow(intersection2.x - midpoint.x, 2) +
						Math.pow(intersection2.y - midpoint.y, 2)
					);
					if (dist < shortestDistance2) {
						shortestDistance2 = dist;
						shortestIntersection2 = intersection2;
					}
				}
			}

			if (shortestIntersection1) {
				ray1.length = shortestDistance1;
			}
			if (shortestIntersection2) {
				ray2.length = shortestDistance2;
			}

			rays.push(ray1, ray2);
		}
		return rays;
	});


	rayPairs = $derived.by(() => {
		if (this.rays.length < 2) return [];

		const allPairs: RayPair[] = [];
		const EPSILON = 0.1;

		for (let i = 0; i < this.rays.length; i++) {
			for (let j = i + 1; j < this.rays.length; j++) {
				const ray1 = this.rays[i];
				const ray2 = this.rays[j];

				if (!ray1.origin || !ray2.origin) continue;

				// // Early exit: skip rays that can't possibly intersect based on max reach
				const maxDistance = ray1.length + ray2.length;
				const originsDistanceSquared =
					Math.pow(ray2.origin.x - ray1.origin.x, 2) +
					Math.pow(ray2.origin.y - ray1.origin.y, 2);
				if (originsDistanceSquared > maxDistance * maxDistance) continue;

				const angleDiff = Math.abs(ray1.angle - ray2.angle);
				const isOpposite = Math.abs(Math.abs(angleDiff - Math.PI)) < 0.1 + EPSILON;

				if (isOpposite) {
					// Collinear opposite rays: cost is distance between origins (AD)
					const originsDistance = Math.sqrt(
						Math.pow(ray2.origin.x - ray1.origin.x, 2) +
						Math.pow(ray2.origin.y - ray1.origin.y, 2)
					);

					allPairs.push({
						ray1,
						ray2,
						totalLength: originsDistance,
						intersectionPoint: ray1.origin,
						clippedRay1: ray1,
						clippedRay2: ray2
					});
					continue;
				}

				// Check if rays intersect
				const intersection = ray1.intersect(ray2);
				if (intersection) {
					const distAPSquared =
						Math.pow(intersection.x - ray1.origin.x, 2) +
						Math.pow(intersection.y - ray1.origin.y, 2);
					const distPDSquared =
						Math.pow(intersection.x - ray2.origin.x, 2) +
						Math.pow(intersection.y - ray2.origin.y, 2);

					const distAP = Math.sqrt(distAPSquared);
					const distPD = Math.sqrt(distPDSquared);

					// if these were let in, because we want the 
					// smallest numbers, they would score the highest 
					// and display nothing
					if (distAP + distPD == 0) continue;

					allPairs.push({
						ray1,
						ray2,
						totalLength: distAP + distPD,
						intersectionPoint: intersection,
						clippedRay1: Ray.rayFromEdge(new Edge(ray1.origin, intersection)),
						clippedRay2: Ray.rayFromEdge(new Edge(ray2.origin, intersection))
					});
				}
			}
		}

		allPairs.sort((a, b) => {
			const diff = a.totalLength - b.totalLength;
			return Math.abs(diff) < EPSILON ? 0 : diff;
		});

		const selectedPairs: RayPair[] = [];
		const usedRays = new Set<Ray>();

		for (const pair of allPairs) {
			if (!usedRays.has(pair.ray1) && !usedRays.has(pair.ray2)) {
				selectedPairs.push(pair);
				usedRays.add(pair.ray1);
				usedRays.add(pair.ray2);
			}
		}

		return selectedPairs;
	});

	constructor(verticesOrConfig: Point[] | PolygonConfig) {
		if (Array.isArray(verticesOrConfig)) {
			this._manualVertices = verticesOrConfig;
		} else {
			const { sides, radius = 50, centerX = 0, centerY = 0, motifColor = 'purple' } = verticesOrConfig;
			this.sides = sides;
			this.radius = radius;
			this.centerX = centerX;
			this.centerY = centerY;
			this.style = verticesOrConfig.style;
			this.motifColor = motifColor;
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

	static octagon(radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regular(8, radius, centerX, centerY);
	}

	static dodecagon(radius: number = 50, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regular(12, radius, centerX, centerY);
	}

	private static sideLengthToRadius(sides: number, sideLength: number): number {
		return sideLength / (2 * Math.sin(Math.PI / sides));
	}

	static regularBySideLength(sides: number, sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		const radius = Polygon.sideLengthToRadius(sides, sideLength);
		return Polygon.regular(sides, radius, centerX, centerY);
	}

	static triangleBySideLength(sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regularBySideLength(3, sideLength, centerX, centerY);
	}

	static squareBySideLength(sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regularBySideLength(4, sideLength, centerX, centerY);
	}

	static pentagonBySideLength(sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regularBySideLength(5, sideLength, centerX, centerY);
	}

	static hexagonBySideLength(sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regularBySideLength(6, sideLength, centerX, centerY);
	}

	static octagonBySideLength(sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regularBySideLength(8, sideLength, centerX, centerY);
	}

	static dodecagonBySideLength(sideLength: number, centerX: number = 0, centerY: number = 0): Polygon {
		return Polygon.regularBySideLength(12, sideLength, centerX, centerY);
	}


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

	draw(ctx: CanvasRenderingContext2D, midpoints: boolean = false, rays: boolean = true, showPolygon: boolean = true, showMotif: boolean = false, showIntersectionPoints: boolean = false): void {
		if (this.vertices.length < 2) return;

		if (showPolygon) {
			ctx.beginPath();
			ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
			for (let i = 1; i < this.vertices.length; i++) {
				ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
			}
			ctx.closePath();
			this.color(ctx);
		}


		if (showMotif) {
			// Show clipped ray pairs (Islamic motif)
			ctx.save();
			const motifColor = this.style?.motifColor ?? this.motifColor;
			ctx.strokeStyle = Canvas.computeColor(motifColor);
			ctx.lineWidth = 2;

			for (const pair of this.rayPairs) {
				if (!pair.clippedRay1.origin || !pair.clippedRay2.origin) continue;

				ctx.beginPath();

				// Draw clipped ray1: A to P
				ctx.moveTo(pair.clippedRay1.origin.x, pair.clippedRay1.origin.y);
				ctx.lineTo(pair.clippedRay1.endpoint.x, pair.clippedRay1.endpoint.y);

				// Draw clipped ray2: P to D  
				ctx.moveTo(pair.clippedRay2.origin.x, pair.clippedRay2.origin.y);
				ctx.lineTo(pair.clippedRay2.endpoint.x, pair.clippedRay2.endpoint.y);

				ctx.stroke();
			}
			ctx.restore();
		}

		if (midpoints) {
			ctx.beginPath();
			for (let i = 0; i < this.midpoints.length; i++) {
				const midpoint = this.midpoints[i];
				ctx.moveTo(midpoint.x + 2, midpoint.y);
				ctx.ellipse(midpoint.x, midpoint.y, 4, 4, 0, 0, Math.PI * 2);
			}
			ctx.fillStyle = 'red';
			ctx.fill();
		}

		if (rays && !showMotif) {
			// Show individual rays (original behavior)
			ctx.beginPath();
			for (const ray of this.rays) {
				if (ray.origin) {
					const endpoint = ray.endpoint;
					ctx.moveTo(ray.origin.x, ray.origin.y);
					ctx.lineTo(endpoint.x, endpoint.y);
				}
			}
			ctx.strokeStyle = 'blue';
			ctx.stroke();
		}

		if (showIntersectionPoints) {
			ctx.save();
			ctx.fillStyle = 'orange';
			ctx.beginPath();
			for (const pair of this.rayPairs) {
				const point = pair.intersectionPoint;
				ctx.moveTo(point.x + 3, point.y);
				ctx.ellipse(point.x, point.y, 3, 3, 0, 0, Math.PI * 2);
			}
			ctx.fill();
			ctx.restore();
		}
	}

	color(ctx: CanvasRenderingContext2D): void {
		const fillColor = this.style?.fill ?? 'aquamarine';
		const strokeColor = this.style?.stroke ?? 'white';
		const fillOpacity = this.style?.fillOpacity ?? 1;
		const strokeOpacity = this.style?.strokeOpacity ?? 1;

		ctx.fillStyle = Canvas.applyOpacity(Canvas.computeColor(fillColor), fillOpacity, ctx);
		ctx.strokeStyle = Canvas.applyOpacity(Canvas.computeColor(strokeColor), strokeOpacity, ctx);
		ctx.lineWidth = this.style?.strokeWidth ?? 1;
		ctx.fill()
		ctx.stroke()
	}
}
