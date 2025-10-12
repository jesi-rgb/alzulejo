import type { TilePosition, Bounds, UnitDimensions } from './types';

export abstract class TessellationPattern {
	constructor(protected size: number) { }

	abstract generatePositions(bounds: Bounds): Generator<TilePosition>;
	abstract getUnitDimensions(): UnitDimensions;
}
