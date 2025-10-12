import type { Polygon } from "./polygon.svelte";
import { Tessellation } from "./tessellation.svelte";
export declare class RosetteTransform {
    tessellation: Tessellation;
    constructor(t: Tessellation);
    private calculateInnerRadius;
    private applyIrregularTransform;
    private applyRegularTransform;
    applyPolygonTransform(p: Polygon): Polygon;
}
