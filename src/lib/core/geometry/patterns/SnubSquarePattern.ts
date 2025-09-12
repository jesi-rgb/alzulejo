import { TessellationPattern } from './TessellationPattern';
import { Polygon } from '../polygon.svelte';
import type { TilePosition, Bounds, UnitDimensions } from './types';

export class SnubSquarePattern extends TessellationPattern {
	getUnitDimensions(): UnitDimensions {
		const s = this.size;
		// The fundamental unit for snub square
		const unitSize = s * Math.sqrt(2 + Math.sqrt(3));
		return { width: unitSize, height: unitSize };
	}

	*generatePositions(bounds: Bounds): Generator<TilePosition> {
		const s = this.size;

		const triangle = Polygon.triangleBySideLength(s);
		const square = Polygon.squareBySideLength(s);

		const triangleRelativeSize = triangle.circumradius / this.size;
		const squareRelativeSize = square.circumradius / this.size;

		// Distance between square centers
		const dY = s * 1.3;
		const dX = s * 1.3;
		const angle = Math.PI / 6;

		for (let row = 0; row <= Math.ceil(bounds.height / dX) + 2; row++) {
			for (let col = 0; col <= Math.ceil(bounds.width / dY) + 2; col++) {


				const baseX = col * dX;
				const baseY = row * dY;

				const chirality = (row % 2 === 0) ? 1 : -1;

				// Main square at grid point
				yield {
					x: baseX,
					y: baseY,
					polygonType: 'square',
					relativeSize: squareRelativeSize,
					rotation: -chirality * angle,
					styleKey: 'default'
				};
				//
				// yield {
				// 	x: baseX - d / 2,
				// 	y: baseY + d / 2,
				// 	polygonType: 'square',
				// 	relativeSize: squareRelativeSize,
				// 	rotation: chirality * angle,
				// 	styleKey: 'default'
				// };
			}
		}
	}
}
