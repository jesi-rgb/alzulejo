import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';
export declare class TrianglePattern extends TessellationPattern {
    private offset;
    constructor(size: number, offset?: number);
    generatePositions(bounds: Bounds): Generator<TilePosition>;
    getUnitDimensions(): UnitDimensions;
}
