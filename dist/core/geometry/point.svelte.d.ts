export declare class Point {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
}
interface Intersectable {
    start: Point | undefined;
    end: Point | undefined;
    intersect(other: Intersectable): Point | null;
}
export declare class Edge implements Intersectable {
    start: Point;
    end: Point;
    constructor(start: Point, end: Point);
    midpoint: Point;
    angle: number;
    magnitude: number;
    intersect(other: Intersectable): Point | null;
}
export declare class Ray implements Intersectable {
    origin: Point;
    direction: number;
    length: number;
    edgeIndex?: number;
    constructor(origin: Point, direction: number, length?: number);
    get start(): Point | undefined;
    get end(): Point | undefined;
    angle: number;
    endpoint: Point;
    intersect(other: Intersectable): Point | null;
    intersectEdge(edge: Edge): Point | null;
    static rayFromEdge(edge: Edge): Ray;
}
export {};
