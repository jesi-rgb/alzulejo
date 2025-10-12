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
    clippedRay1: Ray;
    clippedRay2: Ray;
}
export declare class Polygon {
    style: Style | undefined;
    sides: number;
    radius: number;
    centerX: number;
    centerY: number;
    contactAngle: number;
    motifColor: string;
    _manualVertices: Point[] | null;
    constructor(verticesOrConfig: Point[] | PolygonConfig);
    vertices: Point[];
    area: number;
    perimeter: number;
    center: Point;
    edges: Edge[];
    circumradius: number;
    inradius: number;
    height: number;
    midpoints: Point[];
    apothem: number;
    rays: Ray[];
    motif: RayPair[];
    motifPolygons: Point[][];
    private generateRegularVertices;
    static regular(sides: number, radius?: number, centerX?: number, centerY?: number): Polygon;
    static triangle(radius?: number, centerX?: number, centerY?: number): Polygon;
    static square(radius?: number, centerX?: number, centerY?: number): Polygon;
    static pentagon(radius?: number, centerX?: number, centerY?: number): Polygon;
    static hexagon(radius?: number, centerX?: number, centerY?: number): Polygon;
    static octagon(radius?: number, centerX?: number, centerY?: number): Polygon;
    static dodecagon(radius?: number, centerX?: number, centerY?: number): Polygon;
    private static sideLengthToRadius;
    static regularBySideLength(sides: number, sideLength: number, centerX?: number, centerY?: number): Polygon;
    static triangleBySideLength(sideLength: number, centerX?: number, centerY?: number): Polygon;
    static squareBySideLength(sideLength: number, centerX?: number, centerY?: number): Polygon;
    static pentagonBySideLength(sideLength: number, centerX?: number, centerY?: number): Polygon;
    static hexagonBySideLength(sideLength: number, centerX?: number, centerY?: number): Polygon;
    static octagonBySideLength(sideLength: number, centerX?: number, centerY?: number): Polygon;
    static dodecagonBySideLength(sideLength: number, centerX?: number, centerY?: number): Polygon;
    rotate(angle: number): Polygon;
    contains(point: Point): boolean;
    draw(ctx: CanvasRenderingContext2D, midpoints?: boolean, rays?: boolean, showPolygon?: boolean, showMotif?: boolean, showMotifFilled?: boolean, showIntersectionPoints?: boolean, canvas?: Canvas, motifStartIndex?: number, totalMotifs?: number): void;
    color(ctx: CanvasRenderingContext2D, animationProgress?: number): void;
}
export {};
