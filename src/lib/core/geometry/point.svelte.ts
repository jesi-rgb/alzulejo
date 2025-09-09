export class Point {
	x = $state(0);
	y = $state(0);

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

export class Edge {
	start = $state<Point>();
	end = $state<Point>();

	constructor(start: Point, end: Point) {
		this.start = start;
		this.end = end;
	}

	midpoint = $derived.by(() => {
		if (!this.start || !this.end) return new Point(0, 0);

		return new Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
	});


	angle = $derived.by(() => {
		if (!this.start || !this.end) return 0;

		const dx = this.end.x - this.start.x;
		const dy = this.end.y - this.start.y;

		return Math.atan2(dy, dx);
	});
}

export class Ray {
	origin = $state<Point>();
	direction = $state<number>(0);
	length = $state<number>(100);

	constructor(origin: Point, direction: number, length: number = 100) {
		this.origin = origin;
		this.direction = direction;
		this.length = length;
	}

	endpoint = $derived.by(() => {
		if (!this.origin) return new Point(0, 0);

		const x = this.origin.x + Math.cos(this.direction) * this.length;
		const y = this.origin.y + Math.sin(this.direction) * this.length;
		return new Point(x, y);
	});

	intersectEdge(edge: Edge): Point | null {
		if (!this.origin || !edge.start || !edge.end) return null;

		const rayStart = this.origin;
		const rayEnd = this.endpoint;
		const edgeStart = edge.start;
		const edgeEnd = edge.end;

		const rayDx = rayEnd.x - rayStart.x;
		const rayDy = rayEnd.y - rayStart.y;
		const edgeDx = edgeEnd.x - edgeStart.x;
		const edgeDy = edgeEnd.y - edgeStart.y;

		const det = rayDx * edgeDy - rayDy * edgeDx;
		if (Math.abs(det) < 1e-10) return null;

		const dx = edgeStart.x - rayStart.x;
		const dy = edgeStart.y - rayStart.y;
		
		const u = (dx * edgeDy - dy * edgeDx) / det;
		const v = (dx * rayDy - dy * rayDx) / det;

		if (u >= 0 && v >= 0 && v <= 1) {
			return new Point(
				rayStart.x + u * rayDx,
				rayStart.y + u * rayDy
			);
		}

		return null;
	}
}
