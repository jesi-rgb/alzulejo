
import { Point } from './point.svelte';

export class Vector2D {
	constructor(public start: Point, public end: Point) { }

	get x(): number {
		return this.end.x - this.start.x;
	}

	get y(): number {
		return this.end.y - this.start.y;
	}

	magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(): Vector2D {
		const mag = this.magnitude();
		if (mag === 0) return new Vector2D(this.start, this.start);
		const unitX = this.x / mag;
		const unitY = this.y / mag;
		return new Vector2D(
			new Point(0, 0),
			new Point(unitX, unitY)
		);
	}

	add(other: Vector2D): Vector2D {
		return new Vector2D(
			this.start,
			new Point(this.end.x + other.x, this.end.y + other.y)
		);
	}

	subtract(other: Vector2D): Vector2D {
		return new Vector2D(
			this.start,
			new Point(this.end.x - other.x, this.end.y - other.y)
		);
	}

	dot(other: Vector2D): number {
		return this.x * other.x + this.y * other.y;
	}

	rotate(angle: number): Vector2D {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const rotatedX = this.x * cos - this.y * sin;
		const rotatedY = this.x * sin + this.y * cos;
		return new Vector2D(
			this.start,
			new Point(this.start.x + rotatedX, this.start.y + rotatedY)
		);
	}
}
