import { Polygon } from './polygon.svelte';
import type { Style } from './style.svelte';
type TessellationType = 'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal' | 'snub-square';
interface TessellationConfig {
    type: TessellationType;
    size: number;
    width: number;
    height: number;
    offset?: number;
    contactAngle?: number;
    style?: Style;
    style1?: Style;
    style2?: Style;
    style3?: Style;
    motifColor?: string;
    backgroundColor?: string;
}
export declare class Tessellation {
    type: TessellationType;
    size: number;
    width: number;
    height: number;
    offset: number;
    contactAngle: number;
    motifColor: string;
    backgroundColor: string;
    style: Style | undefined;
    style1: Style | undefined;
    style2: Style | undefined;
    style3: Style | undefined;
    polygons: Polygon[];
    num_elements: number;
    constructor(config: TessellationConfig);
    private generateFromPattern;
    private getPattern;
    bounds: {
        width: number;
        height: number;
        polygonCount: number;
    };
    draw(ctx: CanvasRenderingContext2D, showPolygons?: boolean, showMidpoints?: boolean, showRays?: boolean, showMotif?: boolean, showMotifFilled?: boolean, showIntersectionPoints?: boolean, canvas?: any): void;
    private groupPolygonsByStyle;
    private getStyleKey;
    private drawPolygonGroup;
}
export {};
