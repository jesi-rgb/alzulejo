import { Polygon } from "./polygon.svelte";
export declare class Rosette {
    static calculateInnerRadius(r: number, n: number): number;
    static transform(polygons: Polygon[]): Polygon[];
}
