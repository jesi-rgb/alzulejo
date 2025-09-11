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

		// Use side-length-based methods for consistent edge lengths
		const triangle = Polygon.triangleBySideLength(sharedEdgeLength);
		const square = Polygon.squareBySideLength(sharedEdgeLength);
		const hexagon = Polygon.hexagonBySideLength(sharedEdgeLength);

		// Calculate relative sizes for the PolygonFactory
		const triangleRelativeSize = triangle.circumradius / this.size;
		const squareRelativeSize = square.circumradius / this.size;
		const hexagonRelativeSize = hexagon.circumradius / this.size;

		// Minimal unit: Hex → Tri → Square → Tri (horizontally aligned)
		const hexWidth = hexagon.circumradius * 2 * Math.cos(Math.PI / 6);
		const triWidth = triangle.circumradius * 2 * Math.cos(Math.PI / 6);
		const squareWidth = square.circumradius * Math.sqrt(2);

		const stepX = hexWidth + triWidth + squareWidth + triWidth;
		const stepY = hexagon.circumradius * 2;

		for (let row = 0; row < Math.ceil(bounds.height / stepY) + 2; row++) {
			for (let col = 0; col < Math.ceil(bounds.width / stepX) + 2; col++) {
				const baseX = col * stepX - stepX;
				const baseY = row * stepY - stepY;

				// Shift every other row by half unit + square separation
				const offsetX = row % 2 === 0 ? 0 : stepX * 0.5 + squareWidth * 0.5;
				const rowOffsetY = row % 2 === 0 ? 0 : squareWidth * 0.5; // Add vertical separation

				// Minimal unit pattern: Hex → Tri → Square → Tri
				let currentX = baseX + offsetX;
				const unitY = baseY + stepY / 2 + rowOffsetY;

				// 1. Hexagon
				yield {
					x: currentX + hexWidth / 2,
					y: unitY,
					polygonType: 'hexagon',
					relativeSize: hexagonRelativeSize,
					rotation: Math.PI / 6,
					styleKey: 'style1'
				};
				currentX += hexWidth;

				// 2. First Triangle (rotated)
				yield {
					x: sharedEdgeLength + (triangle.height - 0.5 * sharedEdgeLength),
					y: unitY,
					polygonType: 'triangle',
					relativeSize: triangleRelativeSize,
					rotation: -Math.PI / 2, // Rotated
					styleKey: 'style2'
				};
				currentX += triWidth;

				// 3. Square
				yield {
					x: currentX + squareWidth / 2,
					y: unitY,
					polygonType: 'square',
					relativeSize: squareRelativeSize,
					rotation: Math.PI / 4,
					styleKey: 'default'
				};
				currentX += squareWidth;

				// 4. Second Triangle (rotated)
				yield {
					x: currentX + triWidth / 2,
					y: unitY,
					polygonType: 'triangle',
					relativeSize: triangleRelativeSize,
					rotation: Math.PI, // Rotated
					styleKey: 'style2'
				};

				// Add row separator squares for even rows
				if (row % 2 === 0 && col === 0) {
					yield {
						x: baseX + stepX / 2,
						y: baseY + stepY + squareWidth / 2,
						polygonType: 'square',
						relativeSize: squareRelativeSize,
						rotation: Math.PI / 4,
						styleKey: 'default'
					};
				}
			}
		}
	}
}
