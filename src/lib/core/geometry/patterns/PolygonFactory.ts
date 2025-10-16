import { Polygon } from '../polygon.svelte';
import type { Style } from '../style.svelte';
import type { TileDefinition } from './types';

export class PolygonFactory {
	constructor(
		private baseSize: number,
		private contactAngle: number,
		private motifColor: string,
		private defaultStyle?: Style,
		private style1?: Style,
		private style2?: Style,
		private style3?: Style
	) { }

	create(tile: TileDefinition, x: number, y: number): Polygon {
		const actualSize = this.baseSize * tile.relativeSize;
		let polygon: Polygon;

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
			case 'dodecagon':
				polygon = Polygon.dodecagon(actualSize, x, y);
				break;
		}

		if (tile.rotation) {
			polygon = polygon.rotate(tile.rotation);
		}

		polygon.contactAngle = this.contactAngle;
		polygon.motifColor = this.motifColor;
		polygon.style = this.getStyle()

		const style = this.getStyle(tile.styleKey);
		if (style) {
			polygon.style = style;
		}

		return polygon;
	}

	private getStyle(styleKey?: string): Style | undefined {
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
