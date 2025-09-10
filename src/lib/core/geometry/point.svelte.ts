export class Point {
	x = $state(0);
	y = $state(0);

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

interface Intersectable {
	start: Point | undefined;
	end: Point | undefined;
	intersect(other: Intersectable): Point | null;
}

export class Edge implements Intersectable {
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


	magnitude = $derived.by(() => {
		if (!this.start || !this.end) return 0;

		const dx = this.end.x - this.start.x;
		const dy = this.end.y - this.start.y;

		return Math.sqrt(dx * dx + dy * dy);
	});

	intersect(other: Intersectable): Point | null {
		if (!this.start || !this.end || !other.start || !other.end) return null;

		const line1Start = this.start;
		const line1End = this.end;
		const line2Start = other.start;
		const line2End = other.end;

		const line1Dx = line1End.x - line1Start.x;
		const line1Dy = line1End.y - line1Start.y;
		const line2Dx = line2End.x - line2Start.x;
		const line2Dy = line2End.y - line2Start.y;

		const det = line1Dx * line2Dy - line1Dy * line2Dx;
		if (Math.abs(det) < 1e-10) return null;

		const dx = line2Start.x - line1Start.x;
		const dy = line2Start.y - line1Start.y;

		const u = (dx * line2Dy - dy * line2Dx) / det;
		const v = (dx * line1Dy - dy * line1Dx) / det;

		if (u >= 0 && v >= 0 && v <= 1) {
			return new Point(
				line1Start.x + u * line1Dx,
				line1Start.y + u * line1Dy
			);
		}

		return null;
	}
}

export class Ray implements Intersectable {
	origin = $state<Point>();
	direction = $state<number>(0);
	length = $state<number>(100);

	constructor(origin: Point, direction: number, length: number = 100) {
		this.origin = origin;
		this.direction = direction;
		this.length = length;
	}

	get start(): Point | undefined {
		return this.origin;
	}

	get end(): Point | undefined {
		return this.endpoint;
	}

	angle = $derived(Math.atan2(this.direction, 1));

	endpoint = $derived.by(() => {
		if (!this.origin) return new Point(0, 0);

		const x = this.origin.x + Math.cos(this.direction) * this.length;
		const y = this.origin.y + Math.sin(this.direction) * this.length;
		return new Point(x, y);
	});

	intersect(other: Intersectable): Point | null {
		if (!this.start || !this.end || !other.start || !other.end) return null;

		const line1Start = this.start;
		const line1End = this.end;
		const line2Start = other.start;
		const line2End = other.end;

		const line1Dx = line1End.x - line1Start.x;
		const line1Dy = line1End.y - line1Start.y;
		const line2Dx = line2End.x - line2Start.x;
		const line2Dy = line2End.y - line2Start.y;

		const det = line1Dx * line2Dy - line1Dy * line2Dx;
		if (Math.abs(det) < 1e-10) return null;

		const dx = line2Start.x - line1Start.x;
		const dy = line2Start.y - line1Start.y;

		const u = (dx * line2Dy - dy * line2Dx) / det;
		const v = (dx * line1Dy - dy * line1Dx) / det;

		if (u >= 0 && v >= 0 && v <= 1) {
			return new Point(
				line1Start.x + u * line1Dx,
				line1Start.y + u * line1Dy
			);
		}

		return null;
	}

	intersectEdge(edge: Edge): Point | null {
		return this.intersect(edge);
	}
}
