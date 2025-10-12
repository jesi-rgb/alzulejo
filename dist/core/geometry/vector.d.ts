import { Point } from './point.svelte';
export declare class Vector2D {
    start: Point;
    end: Point;
    constructor(start: Point, end: Point);
    get x(): number;
    get y(): number;
    magnitude(): number;
    normalize(): Vector2D;
    add(other: Vector2D): Vector2D;
    subtract(other: Vector2D): Vector2D;
    dot(other: Vector2D): number;
    rotate(angle: number): Vector2D;
}
