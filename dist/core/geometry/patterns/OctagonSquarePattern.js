import { TessellationPattern } from './TessellationPattern';
import { Polygon } from '../polygon.svelte';
export class OctagonSquarePattern extends TessellationPattern {
    getUnitDimensions() {
        // For proper 4.8.8 tiling, use the PolygonFactory size as the shared edge length
        const sharedEdgeLength = this.size;
        // Use side-length-based methods for consistent edge lengths
        const octagon = Polygon.octagonBySideLength(sharedEdgeLength);
        const octagonWidth = octagon.circumradius * 2 * Math.cos(Math.PI / 8);
        const octagonApothem = octagon.apothem;
        const stepX = octagonWidth + sharedEdgeLength;
        const stepY = octagonApothem * 2 + sharedEdgeLength;
        return { width: stepX, height: stepY };
    }
    *generatePositions(bounds) {
        // For proper 4.8.8 tiling, use the PolygonFactory size as the shared edge length
        const sharedEdgeLength = this.size;
        // Use side-length-based methods for consistent edge lengths
        const octagon = Polygon.octagonBySideLength(sharedEdgeLength);
        const square = Polygon.squareBySideLength(sharedEdgeLength);
        const octagonWidth = octagon.circumradius * 2 * Math.cos(Math.PI / 8);
        const octagonApothem = octagon.apothem;
        const stepX = octagonWidth + sharedEdgeLength;
        const stepY = octagonApothem * 2 + sharedEdgeLength;
        // Calculate relative sizes for the PolygonFactory
        const octagonRelativeSize = octagon.circumradius / this.size;
        const squareRelativeSize = square.circumradius / this.size;
        for (let row = 0; row < Math.ceil(bounds.height / stepY) + 2; row++) {
            for (let col = 0; col < Math.ceil(bounds.width / stepX) + 2; col++) {
                const baseX = col * stepX - stepX;
                const baseY = row * stepY - stepY;
                // Main octagon at center of unit - with matching edge length
                yield {
                    x: baseX + stepX / 2,
                    y: baseY + stepY / 2,
                    polygonType: 'octagon',
                    relativeSize: octagonRelativeSize,
                    styleKey: 'style1'
                };
                yield {
                    x: baseX + stepX,
                    y: baseY + stepY,
                    polygonType: 'octagon',
                    relativeSize: octagonRelativeSize,
                    styleKey: 'style1'
                };
                // Bottom square
                yield {
                    x: baseX + stepX / 2,
                    y: baseY + stepY,
                    polygonType: 'square',
                    relativeSize: squareRelativeSize,
                    styleKey: 'style2'
                };
                // Left square
                yield {
                    x: baseX,
                    y: baseY + stepY / 2,
                    polygonType: 'square',
                    relativeSize: squareRelativeSize,
                    styleKey: 'style2'
                };
            }
        }
    }
}
