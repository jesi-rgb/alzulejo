
import { Polygon } from '../polygon.svelte';
import { TessellationPattern } from './TessellationPattern';
import type { TilePosition, Bounds, UnitDimensions } from './types';

export class TruncatedHexagonalPattern extends TessellationPattern {
  *generatePositions(bounds: Bounds): Generator<TilePosition> {
    const sharedEdgeLength = this.size / 2; // dodecagons are a bit too big by default 

    const dodecagon = Polygon.dodecagonBySideLength(sharedEdgeLength);
    const triangle = Polygon.triangleBySideLength(sharedEdgeLength);


    const stepX = dodecagon.apothem * 2
    const stepY = stepX;

    const dodecagonRelativeSize = dodecagon.circumradius / this.size;
    const triangleRelativeSize = triangle.circumradius / this.size;

    for (let row = -1; row < Math.ceil(bounds.height / stepY) + 1; row++) {
      for (let col = 0; col < Math.ceil(bounds.width / stepX) + 2; col++) {
        const offsetY = col % 2 === 0 ? 0 : stepY * 0.5;

        const baseX = col * (stepX - sharedEdgeLength * .5);
        const baseY = row * stepY + offsetY;

        yield {
          x: baseX,
          y: baseY,
          polygonType: 'dodecagon',
          relativeSize: dodecagonRelativeSize,
          styleKey: 'style1'
        };

        //////////////////////////////////////////

        yield {
          x: baseX - dodecagon.apothem - triangle.circumradius / 2,
          y: baseY,
          polygonType: 'triangle',
          relativeSize: triangleRelativeSize,
          rotation: Math.PI / 2,
          styleKey: 'style3' // green
        };

        yield {
          x: baseX + dodecagon.apothem + triangle.circumradius / 2,
          y: baseY,
          polygonType: 'triangle',
          relativeSize: triangleRelativeSize,
          rotation: -Math.PI / 2,
          styleKey: 'style2'
        };

      }
    }
  }

  getUnitDimensions(): UnitDimensions {
    // const sharedEdgeLength = this.size
    // const dodecagon = Polygon.dodecagonBySideLength(sharedEdgeLength);
    // const dodecagonWidth = dodecagon.circumradius * 2 * Math.cos(Math.PI / 12);
    // const dodecagonApothem = dodecagon.apothem;
    //
    // const stepX = dodecagonWidth + sharedEdgeLength;
    // const stepY = dodecagonApothem * 2 + sharedEdgeLength;

    return { width: 0, height: 0 };
  }
}
