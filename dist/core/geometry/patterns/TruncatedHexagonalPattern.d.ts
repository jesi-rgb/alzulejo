import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';
export declare class TruncatedHexagonalPattern extends TessellationPattern {
    generatePositions(bounds: Bounds): Generator<TilePosition>;
    getUnitDimensions(): UnitDimensions;
}
