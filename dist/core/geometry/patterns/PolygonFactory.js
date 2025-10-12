import { Polygon } from '../polygon.svelte';
export class PolygonFactory {
    baseSize;
    contactAngle;
    motifColor;
    defaultStyle;
    style1;
    style2;
    style3;
    constructor(baseSize, contactAngle, motifColor, defaultStyle, style1, style2, style3) {
        this.baseSize = baseSize;
        this.contactAngle = contactAngle;
        this.motifColor = motifColor;
        this.defaultStyle = defaultStyle;
        this.style1 = style1;
        this.style2 = style2;
        this.style3 = style3;
    }
    create(tile, x, y) {
        const actualSize = this.baseSize * tile.relativeSize;
        let polygon;
        switch (tile.polygonType) {
            case 'triangle':
                polygon = Polygon.triangle(actualSize, x, y);
                break;
            case 'square':
                polygon = Polygon.square(actualSize, x, y);
                break;
            case 'hexagon':
                polygon = Polygon.hexagon(actualSize, x, y);
                break;
            case 'octagon':
                polygon = Polygon.octagon(actualSize, x, y);
                break;
        }
        if (tile.rotation) {
            polygon = polygon.rotate(tile.rotation);
        }
        polygon.contactAngle = this.contactAngle;
        polygon.motifColor = this.motifColor;
        const style = this.getStyle(tile.styleKey);
        if (style) {
            polygon.style = style;
        }
        return polygon;
    }
    getStyle(styleKey) {
        switch (styleKey) {
            case 'style1':
                return this.style1 || this.defaultStyle;
            case 'style2':
                return this.style2 || this.defaultStyle;
            case 'style3':
                return this.style3 || this.defaultStyle;
            default:
                return this.defaultStyle;
        }
    }
}
