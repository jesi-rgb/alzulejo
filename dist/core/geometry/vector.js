import { Point } from './point.svelte';
export class Vector2D {
    start;
    end;
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    get x() {
        return this.end.x - this.start.x;
    }
    get y() {
        return this.end.y - this.start.y;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const mag = this.magnitude();
        if (mag === 0)
            return new Vector2D(this.start, this.start);
        const unitX = this.x / mag;
        const unitY = this.y / mag;
        return new Vector2D(new Point(0, 0), new Point(unitX, unitY));
    }
    add(other) {
        return new Vector2D(this.start, new Point(this.end.x + other.x, this.end.y + other.y));
    }
    subtract(other) {
        return new Vector2D(this.start, new Point(this.end.x - other.x, this.end.y - other.y));
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rotatedX = this.x * cos - this.y * sin;
        const rotatedY = this.x * sin + this.y * cos;
        return new Vector2D(this.start, new Point(this.start.x + rotatedX, this.start.y + rotatedY));
    }
}
