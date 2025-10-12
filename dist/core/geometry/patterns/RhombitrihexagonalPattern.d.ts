import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';
export declare class RhombitrihexagonalPattern extends TessellationPattern {
    getUnitDimensions(): UnitDimensions;
    generatePositions(bounds: Bounds): Generator<TilePosition>;
}
