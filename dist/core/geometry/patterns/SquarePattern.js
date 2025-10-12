import { TessellationPattern } from './TessellationPattern';
export class SquarePattern extends TessellationPattern {
    *generatePositions(bounds) {
        const { width: unitWidth, height: unitHeight } = this.getUnitDimensions();
        for (let row = 0; row < Math.ceil(bounds.height / unitHeight) + 1; row++) {
            const offsetX = row % 2 === 0 ? 0 : this.size;
            for (let col = 0; col < Math.ceil(bounds.width / unitWidth) + 1; col++) {
                yield {
                    x: col * unitWidth + offsetX,
                    y: row * unitHeight,
                    polygonType: 'square',
                    relativeSize: 1.0,
                    styleKey: 'default'
                };
            }
        }
    }
    getUnitDimensions() {
        const width = this.size * 2;
        const height = this.size;
        return { width, height };
    }
}
