import { TessellationPattern } from './TessellationPattern';
import { Polygon } from '../polygon.svelte';
export class RhombitrihexagonalPattern extends TessellationPattern {
    getUnitDimensions() {
        const sharedEdgeLength = this.size;
        const triangle = Polygon.triangleBySideLength(sharedEdgeLength);
        const square = Polygon.squareBySideLength(sharedEdgeLength);
        const hexagon = Polygon.hexagonBySideLength(sharedEdgeLength);
        const hexWidth = hexagon.circumradius * 2 * Math.cos(Math.PI / 6);
        const triWidth = triangle.circumradius * 2 * Math.cos(Math.PI / 6);
        const squareWidth = square.circumradius * Math.sqrt(2);
        const stepX = hexWidth + triWidth + squareWidth + triWidth;
        const stepY = hexagon.circumradius * 2; // Height of the pattern unit
        return { width: stepX, height: stepY };
    }
    *generatePositions(bounds) {
        const s = this.size;
        const triangle = Polygon.triangleBySideLength(s);
        const square = Polygon.squareBySideLength(s);
        const hexagon = Polygon.hexagonBySideLength(s);
        const triangleRelativeSize = triangle.circumradius / this.size;
        const squareRelativeSize = square.circumradius / this.size;
        const hexagonRelativeSize = hexagon.circumradius / this.size;
        const hexHeight = hexagon.height;
        const triHeight = triangle.height;
        const squareHeight = square.height;
        const hexWidth = s * 2;
        const squareWidth = s;
        const stepY = hexHeight / 2 + squareHeight / 2;
        const stepX = hexWidth + triHeight + squareWidth + triHeight;
        for (let row = 0; row < Math.ceil(bounds.height / stepY) + 2; row++) {
            for (let col = 0; col < Math.ceil(bounds.width / stepX) + 2; col++) {
                const baseX = col * stepX - stepX;
                const baseY = row * stepY - stepY;
                const offsetX = row % 2 === 0 ? 0 : stepX / 2;
                let currentX = baseX + offsetX;
                const unitY = baseY;
                yield {
                    x: currentX,
                    y: unitY,
                    polygonType: 'hexagon',
                    relativeSize: hexagonRelativeSize,
                    rotation: 0,
                    styleKey: 'style1'
                };
                yield {
                    x: currentX + hexWidth / 2 + triHeight / 1.5,
                    y: unitY,
                    polygonType: 'triangle',
                    relativeSize: triangleRelativeSize,
                    rotation: Math.PI / 2,
                    styleKey: 'style2'
                };
                yield {
                    x: currentX + hexWidth / 2 + triHeight + squareWidth + triHeight * 1 / 3,
                    y: unitY,
                    polygonType: 'triangle',
                    relativeSize: triangleRelativeSize,
                    rotation: -Math.PI / 2, // Rotated
                    styleKey: 'style2'
                };
                yield {
                    x: currentX + hexWidth / 2 + triHeight + s / 2,
                    y: unitY,
                    polygonType: 'square',
                    relativeSize: squareRelativeSize,
                    styleKey: 'style3'
                };
                yield {
                    x: currentX + s * Math.sqrt(3) * ((Math.sqrt(3) + 1) / 4),
                    y: unitY - s * ((Math.sqrt(3) + 1) / 4),
                    polygonType: 'square',
                    relativeSize: squareRelativeSize,
                    rotation: -Math.PI / 6,
                    styleKey: 'style3'
                };
                yield {
                    x: currentX - s * Math.sqrt(3) * ((Math.sqrt(3) + 1) / 4),
                    y: unitY - s * ((Math.sqrt(3) + 1) / 4),
                    polygonType: 'square',
                    relativeSize: squareRelativeSize,
                    rotation: Math.PI / 6,
                    styleKey: 'style3'
                };
            }
        }
    }
}
