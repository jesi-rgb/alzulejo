import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';
export declare class OctagonSquarePattern extends TessellationPattern {
    getUnitDimensions(): UnitDimensions;
    generatePositions(bounds: Bounds): Generator<TilePosition>;
}
