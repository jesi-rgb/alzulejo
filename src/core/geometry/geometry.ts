
interface Point2D {
	x: number;
	y: number;
}


class Vector2D {
	constructor(public x: number, public y: number) { }

	magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(): Vector2D {
		const mag = this.magnitude();
		return mag > 0 ? new Vector2D(this.x / mag, this.y / mag) : new Vector2D(0, 0);
	}

	add(other: Vector2D): Vector2D {
		return new Vector2D(this.x + other.x, this.y + other.y);
	}

	subtract(other: Vector2D): Vector2D {
		return new Vector2D(this.x - other.x, this.y - other.y);
	}

	dot(other: Vector2D): number {
		return this.x * other.x + this.y * other.y;
	}

	rotate(angle: number): Vector2D {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return new Vector2D(
			this.x * cos - this.y * sin,
			this.x * sin + this.y * cos
		);
	}
}

