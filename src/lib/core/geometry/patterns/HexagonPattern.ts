import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';

export class HexagonPattern extends TessellationPattern {
	*generatePositions(bounds: Bounds): Generator<TilePosition> {
		const { width: unitWidth, height: unitHeight } = this.getUnitDimensions();

		for (let row = 0; row < Math.ceil(bounds.height / unitHeight) + 1; row++) {
			const offsetX = row % 2 === 0 ? 0 : unitWidth * 0.5;
			for (let col = 0; col < Math.ceil(bounds.width / unitWidth) + 1; col++) {
				yield {
					x: col * unitWidth + offsetX,
					y: row * unitHeight,
					polygonType: 'hexagon',
					relativeSize: 1.0,
					styleKey: 'default'
				};
			}
		}
	}

	getUnitDimensions(): UnitDimensions {
		const width = this.size * Math.sqrt(3);
		const height = this.size * 1.5;
		return { width, height };
	}
}