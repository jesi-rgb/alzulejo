import { Polygon } from './polygon.svelte';
import { Style } from './style.svelte';
import { Canvas } from '../../render/canvas.svelte';
import {
	TessellationPattern,
	PolygonFactory,
	HexagonPattern,
	TrianglePattern,
	SquarePattern,
	OctagonSquarePattern,
	RhombitrihexagonalPattern
} from './patterns';
import { SnubSquarePattern } from './patterns/SnubSquarePattern';

type TessellationType = 'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal' | 'snub-square';

interface TessellationConfig {
	type: TessellationType;
	size: number;
	width: number;
	height: number;

	offset?: number;
	contactAngle?: number;
	style?: Style;
	style1?: Style;
	style2?: Style;
	style3?: Style;
	motifColor?: string;
	backgroundColor?: string;
}

export class Tessellation {
	type = $state<TessellationType>("hexagon");
	size = $state(50);
	width = $state(800);
	height = $state(600);

	offset = $state(0);
	contactAngle = $state(22.5);
	motifColor = $state<string>('purple');
	backgroundColor = $state<string>('#f5f5dc');
	style = $state<Style>();
	style1 = $state<Style>();
	style2 = $state<Style>();
	style3 = $state<Style>();

	polygons: Polygon[] = $derived.by(() => {
		const newSystemTypes = ['triangle', 'square', 'hexagon', 'octagon-square', 'rhombitrihexagonal', 'snub-square'];
		if (newSystemTypes.includes(this.type)) {
			return this.generateFromPattern();
		}

		// Fallback for any remaining old system types
		return [];
	});

	num_elements = $derived(this.polygons.length)

	constructor(config: TessellationConfig) {
		this.type = config.type;
		this.size = config.size;
		this.width = config.width;
		this.height = config.height;

		this.offset = config.offset ?? 0;
		this.contactAngle = config.contactAngle ?? 22.5;
		this.motifColor = config.motifColor ?? 'purple';
		this.backgroundColor = config.backgroundColor ?? '#f5f5dc';
		this.style = config.style;
		this.style1 = config.style1;
		this.style2 = config.style2;
		this.style3 = config.style3;
	}


	private generateFromPattern(): Polygon[] {
		const pattern = this.getPattern();
		if (!pattern) return [];

		const factory = new PolygonFactory(
			this.size,
			this.contactAngle,
			this.motifColor,
			this.style,
			this.style1,
			this.style2,
			this.style3
		);

		const polygons: Polygon[] = [];
		const bounds = { width: this.width, height: this.height };

		for (const tilePosition of pattern.generatePositions(bounds)) {
			const polygon = factory.create(tilePosition, tilePosition.x, tilePosition.y);
			polygons.push(polygon);
		}

		// if (this.rosette) {
		// 	return new RosetteTransform(this);
		// }

		return polygons;
	}

	private getPattern(): TessellationPattern | null {
		switch (this.type) {
			case 'hexagon':
				return new HexagonPattern(this.size);
			case 'triangle':
				return new TrianglePattern(this.size);
			case 'square':
				return new SquarePattern(this.size);
			case 'octagon-square':
				return new OctagonSquarePattern(this.size);
			case 'rhombitrihexagonal':
				return new RhombitrihexagonalPattern(this.size);
			case 'snub-square':
				return new SnubSquarePattern(this.size);
			default:
				return null;
		}
	}

	bounds = $derived({
		width: this.width,
		height: this.height,
		polygonCount: this.polygons.length
	});

	draw(ctx: CanvasRenderingContext2D, showPolygons: boolean = true,
		showMidpoints: boolean = false,
		showRays: boolean = false, showMotif: boolean = true, showMotifFilled: boolean = false, showIntersectionPoints: boolean = false): void {
		if (this.polygons.length === 0) return;

		if (showPolygons) {
			const styleGroups = this.groupPolygonsByStyle();

			for (const [, polygons] of styleGroups) {
				this.drawPolygonGroup(ctx, polygons);
			}
		}

		if (showMidpoints || showRays || showMotif || showMotifFilled || showIntersectionPoints) {
			for (const polygon of this.polygons) {
				polygon.draw(ctx, showMidpoints, showRays, false, showMotif, showMotifFilled, showIntersectionPoints);
			}
		}
	}

	_draw(ctx: CanvasRenderingContext2D): void {
		if (this.polygons.length === 0) return;
		this.polygons.forEach(polygon => polygon.draw(ctx));
	}


	private groupPolygonsByStyle(): Map<string, Polygon[]> {
		const groups = new Map<string, Polygon[]>();

		for (const polygon of this.polygons) {
			const key = this.getStyleKey(polygon.style);

			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)!.push(polygon);
		}

		return groups;
	}

	private getStyleKey(style?: Style): string {
		if (!style) return 'default';

		return `${style.fill}-${style.fillOpacity}-${style.stroke}-${style.strokeWidth}-${style.strokeOpacity}`;
	}



	private drawPolygonGroup(ctx: CanvasRenderingContext2D, polygons: Polygon[]): void {
		if (polygons.length === 0) return;

		const batchPath = new Path2D();

		for (const polygon of polygons) {
			if (polygon.vertices.length < 2) continue;

			batchPath.moveTo(polygon.vertices[0].x, polygon.vertices[0].y);
			for (let i = 1; i < polygon.vertices.length; i++) {
				batchPath.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
			}
			batchPath.closePath();
		}

		const firstPolygon = polygons[0];
		const fillColor = firstPolygon.style?.fill ?? 'aquamarine';
		const strokeColor = firstPolygon.style?.stroke ?? 'white';
		const fillOpacity = firstPolygon.style?.fillOpacity ?? 1;
		const strokeOpacity = firstPolygon.style?.strokeOpacity ?? 1;

		ctx.fillStyle = Canvas.applyOpacity(Canvas.computeColor(fillColor), fillOpacity, ctx);
		ctx.strokeStyle = Canvas.applyOpacity(Canvas.computeColor(strokeColor), strokeOpacity, ctx);
		ctx.lineWidth = firstPolygon.style?.strokeWidth ?? 1;

		ctx.fill(batchPath);
		ctx.stroke(batchPath);
	}
}
