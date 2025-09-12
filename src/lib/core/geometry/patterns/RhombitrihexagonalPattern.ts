import { TessellationPattern } from './TessellationPattern';
import { Polygon } from '../polygon.svelte';
import type { TilePosition, Bounds, UnitDimensions } from './types';

export class RhombitrihexagonalPattern extends TessellationPattern {
	getUnitDimensions(): UnitDimensions {
		// For rhombitrihexagonal tiling, use shared edge length for all polygons
		const sharedEdgeLength = this.size;

		// Use side-length-based methods for consistent edge lengths
		const triangle = Polygon.triangleBySideLength(sharedEdgeLength);
		const square = Polygon.squareBySideLength(sharedEdgeLength);
		const hexagon = Polygon.hexagonBySideLength(sharedEdgeLength);

		// Minimal unit: Hex → Tri → Square → Tri (horizontally aligned)
		// Unit width: hex width + triangle width + square width + triangle width
		const hexWidth = hexagon.circumradius * 2 * Math.cos(Math.PI / 6);
		const triWidth = triangle.circumradius * 2 * Math.cos(Math.PI / 6);
		const triHeight = triangle.height
		const squareWidth = square.circumradius * Math.sqrt(2);

		const stepX = hexWidth + triWidth + squareWidth + triWidth;
		const stepY = hexagon.circumradius * 2; // Height of the pattern unit

		return { width: stepX, height: stepY };
	}

	*generatePositions(bounds: Bounds): Generator<TilePosition> {
		// For rhombitrihexagonal tiling (3.4.6.4), use shared edge length
		const sharedEdgeLength = this.size;

		const triangle = Polygon.triangleBySideLength(sharedEdgeLength);
		const square = Polygon.squareBySideLength(sharedEdgeLength);
		const hexagon = Polygon.hexagonBySideLength(sharedEdgeLength);

		const triangleRelativeSize = triangle.circumradius / this.size;
		const squareRelativeSize = square.circumradius / this.size;
		const hexagonRelativeSize = hexagon.circumradius / this.size;


		const hexHeight = hexagon.height;
		const triHeight = triangle.height;
		const squareHeight = square.height;

		const hexWidth = sharedEdgeLength * 2;
		const triWidth = sharedEdgeLength, squareWidth = sharedEdgeLength;

		const stepY = hexHeight + squareHeight;
		const stepX = hexWidth + triHeight + squareWidth + triHeight;

		for (let row = 0; row < Math.ceil(bounds.height / stepY) + 2; row++) {
			for (let col = 0; col < Math.ceil(bounds.width / stepX) + 2; col++) {
				const baseX = col * stepX - stepX;
				const baseY = row * stepY - stepY;

				// Shift every other row by half unit + square separation
				const offsetX = row % 2 === 0 ? 0 : stepX / 2;
				const rowOffsetY = row % 2 === 0 ? 0 : squareWidth * 0.5; // Add vertical separation

				// Minimal unit pattern: Hex → Tri → Square → Tri
				let currentX = baseX + offsetX;
				const unitY = baseY + stepY / 2 + rowOffsetY;

				// 1. Hexagon
				yield {
					x: currentX,
					y: unitY,
					polygonType: 'hexagon',
					relativeSize: hexagonRelativeSize,
					rotation: Math.PI / 6,
					styleKey: 'style1'
				};

				// 2. First Triangle (rotated)
				yield {
					x: currentX + hexWidth / 2 + triHeight / 1.5,
					y: unitY,
					polygonType: 'triangle',
					relativeSize: triangleRelativeSize,
					rotation: -Math.PI / 2, // Rotated
					styleKey: 'style2'
				};

				// 3. Square
				yield {
					x: currentX + hexWidth / 2 + triHeight + sharedEdgeLength / 2,
					y: unitY,
					polygonType: 'square',
					relativeSize: squareRelativeSize,
					rotation: Math.PI / 4,
					styleKey: 'default'
				};

				yield {
					x: currentX + hexWidth / 2 + triHeight + squareWidth + triHeight * 1 / 3,
					y: unitY,
					polygonType: 'triangle',
					relativeSize: triangleRelativeSize,
					rotation: Math.PI / 2, // Rotated
					styleKey: 'style2'
				};
			}
		}
	}
}
