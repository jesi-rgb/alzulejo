declare class Vector2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
    magnitude(): number;
    normalize(): Vector2D;
    add(other: Vector2D): Vector2D;
    subtract(other: Vector2D): Vector2D;
    dot(other: Vector2D): number;
    rotate(angle: number): Vector2D;
}
