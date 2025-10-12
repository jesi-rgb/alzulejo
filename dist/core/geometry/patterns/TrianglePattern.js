import { TessellationPattern } from './TessellationPattern';
export class TrianglePattern extends TessellationPattern {
    offset;
    constructor(size, offset = 0) {
        super(size);
        this.offset = offset;
    }
    *generatePositions(bounds) {
        const { width: unitWidth, height: unitHeight } = this.getUnitDimensions();
        const sideLength = 2 * this.size * Math.sin(Math.PI / 3);
        for (let row = 0; row < Math.ceil(bounds.height / unitHeight) + 1; row++) {
            const offsetX = row % 2 === 0 ? this.offset : (sideLength * 0.5) + this.offset;
            for (let col = 0; col < Math.ceil(bounds.width / unitWidth) + 1; col++) {
                const x = col * unitWidth + offsetX;
                const y = row * unitHeight;
                const upward = col % 2 === 0;
                yield {
                    x,
                    y: upward ? y - this.size * 0.5 : y,
                    polygonType: 'triangle',
                    relativeSize: 1.0,
                    rotation: upward ? Math.PI : 0,
                    styleKey: upward ? 'style1' : 'style2'
                };
            }
        }
    }
    getUnitDimensions() {
        const sideLength = 2 * this.size * Math.sin(Math.PI / 3);
        const height = this.size * 3 * Math.sin(Math.PI / 6);
        const width = sideLength / 2;
        return { width, height };
    }
}
