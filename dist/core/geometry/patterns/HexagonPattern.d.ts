import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';
export declare class HexagonPattern extends TessellationPattern {
    generatePositions(bounds: Bounds): Generator<TilePosition>;
    getUnitDimensions(): UnitDimensions;
}
