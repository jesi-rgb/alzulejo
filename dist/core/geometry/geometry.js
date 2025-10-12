"use strict";
class Vector2D {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? new Vector2D(this.x / mag, this.y / mag) : new Vector2D(0, 0);
    }
    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2D(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}
