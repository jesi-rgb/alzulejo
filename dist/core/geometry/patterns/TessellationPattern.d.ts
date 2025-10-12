import type { TilePosition, Bounds, UnitDimensions } from './types';
export declare abstract class TessellationPattern {
    protected size: number;
    constructor(size: number);
    abstract generatePositions(bounds: Bounds): Generator<TilePosition>;
    abstract getUnitDimensions(): UnitDimensions;
}
