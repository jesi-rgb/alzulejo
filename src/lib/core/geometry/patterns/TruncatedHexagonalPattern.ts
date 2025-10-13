
import { Polygon } from '../polygon.svelte';
import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';

export class TruncatedHexagonalPattern extends TessellationPattern {
  *generatePositions(bounds: Bounds): Generator<TilePosition> {
    const { width: unitWidth, height: unitHeight } = this.getUnitDimensions();


    const sharedEdgeLength = this.size;
    const dodecagon = Polygon.dodecagonBySideLength(sharedEdgeLength);
    const triangle = Polygon.triangleBySideLength(sharedEdgeLength);

    const dodecagonWidth = dodecagon.circumradius;
    const dodecagonApothem = dodecagon.apothem;

    const stepX = dodecagon.circumradius;
    const stepY = dodecagonWidth;

    const dodecagonRelativeSize = dodecagon.circumradius / this.size;
    const triangleRelativeSize = triangle.circumradius / this.size;

    for (let row = 0; row < Math.ceil(bounds.height / stepY) + 1; row++) {
      for (let col = 0; col < Math.ceil(bounds.width / stepX) + 1; col++) {
        const offsetY = col % 2 === 0 ? 0 : stepY * 0.5;
        const offsetX = col % 2 === 0 ? 0 : 38;

        const baseX = col * stepX;
        const baseY = row * stepY - offsetY;

        yield {
          x: baseX - offsetX,
          y: baseY,
          polygonType: 'dodecagon',
          relativeSize: 1,
          styleKey: 'default'
        };

        yield {
          x: baseX - dodecagonWidth + stepX / 3.5 + 1.2,
          y: baseY,
          polygonType: 'triangle',
          relativeSize: triangleRelativeSize / 2,
          rotation: Math.PI / 2,
          styleKey: 'default'
        };

      }
    }
  }

  getUnitDimensions(): UnitDimensions {
    const sharedEdgeLength = this.size
    const dodecagon = Polygon.dodecagonBySideLength(sharedEdgeLength);
    const dodecagonWidth = dodecagon.circumradius * 2 * Math.cos(Math.PI / 12);
    const dodecagonApothem = dodecagon.apothem;

    const stepX = dodecagonWidth + sharedEdgeLength;
    const stepY = dodecagonApothem * 2 + sharedEdgeLength;

    return { width: stepX, height: stepY };
  }
}
