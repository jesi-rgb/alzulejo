import { Polygon } from '../polygon.svelte';
import type { Style } from '../style.svelte';
import type { TileDefinition } from './types';
export declare class PolygonFactory {
    private baseSize;
    private contactAngle;
    private motifColor;
    private defaultStyle?;
    private style1?;
    private style2?;
    private style3?;
    constructor(baseSize: number, contactAngle: number, motifColor: string, defaultStyle?: Style | undefined, style1?: Style | undefined, style2?: Style | undefined, style3?: Style | undefined);
    create(tile: TileDefinition, x: number, y: number): Polygon;
    private getStyle;
}
