import { Polygon } from './polygon.svelte';
import { Style } from './style.svelte';
import { Canvas } from '../../render/canvas.svelte';
import { TessellationPattern, PolygonFactory, HexagonPattern, TrianglePattern, SquarePattern, OctagonSquarePattern, RhombitrihexagonalPattern } from './patterns';
import { SnubSquarePattern } from './patterns/SnubSquarePattern';
export class Tessellation {
    type = $state("hexagon");
    size = $state(50);
    width = $state(800);
    height = $state(600);
    offset = $state(0);
    contactAngle = $state(22.5);
    motifColor = $state('purple');
    backgroundColor = $state('#f5f5dc');
    style = $state();
    style1 = $state();
    style2 = $state();
    style3 = $state();
    polygons = $derived.by(() => {
        const newSystemTypes = ['triangle', 'square', 'hexagon', 'octagon-square', 'rhombitrihexagonal', 'snub-square'];
        if (newSystemTypes.includes(this.type)) {
            return this.generateFromPattern();
        }
        // Fallback for any remaining old system types
        return [];
    });
    num_elements = $derived(this.polygons.length);
    constructor(config) {
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
    generateFromPattern() {
        const pattern = this.getPattern();
        if (!pattern)
            return [];
        const factory = new PolygonFactory(this.size, this.contactAngle, this.motifColor, this.style, this.style1, this.style2, this.style3);
        const polygons = [];
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
    getPattern() {
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
    draw(ctx, showPolygons = true, showMidpoints = false, showRays = false, showMotif = true, showMotifFilled = false, showIntersectionPoints = false, canvas) {
        if (this.polygons.length === 0)
            return;
        if (showPolygons) {
            const styleGroups = this.groupPolygonsByStyle();
            for (const [, polygons] of styleGroups) {
                this.drawPolygonGroup(ctx, polygons);
            }
        }
        if (showMidpoints || showRays || showMotif || showMotifFilled || showIntersectionPoints) {
            let motifIndex = 0;
            const totalMotifs = showMotifFilled
                ? this.polygons.reduce((sum, p) => sum + p.motifPolygons.length, 0)
                : 0;
            for (let i = 0; i < this.polygons.length; i++) {
                this.polygons[i].draw(ctx, showMidpoints, showRays, false, showMotif, showMotifFilled, showIntersectionPoints, canvas, motifIndex, totalMotifs);
                if (showMotifFilled) {
                    motifIndex += this.polygons[i].motifPolygons.length;
                }
            }
        }
    }
    groupPolygonsByStyle() {
        const groups = new Map();
        for (const polygon of this.polygons) {
            const key = this.getStyleKey(polygon.style);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(polygon);
        }
        return groups;
    }
    getStyleKey(style) {
        if (!style)
            return 'default';
        return `${style.fill}-${style.fillOpacity}-${style.stroke}-${style.strokeWidth}-${style.strokeOpacity}`;
    }
    drawPolygonGroup(ctx, polygons) {
        if (polygons.length === 0)
            return;
        for (const polygon of polygons) {
            if (polygon.vertices.length < 2)
                continue;
            const path = new Path2D();
            path.moveTo(polygon.vertices[0].x, polygon.vertices[0].y);
            for (let i = 1; i < polygon.vertices.length; i++) {
                path.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
            }
            path.closePath();
            const fillColor = polygon.style?.fill ?? 'aquamarine';
            const strokeColor = polygon.style?.stroke ?? 'white';
            const fillOpacity = polygon.style?.fillOpacity ?? 1;
            const strokeOpacity = polygon.style?.strokeOpacity ?? 1;
            ctx.fillStyle = Canvas.applyOpacity(Canvas.computeColor(fillColor), fillOpacity, ctx);
            ctx.strokeStyle = Canvas.applyOpacity(Canvas.computeColor(strokeColor), strokeOpacity, ctx);
            ctx.lineWidth = polygon.style?.strokeWidth ?? 1;
            ctx.fill(path);
            ctx.stroke(path);
        }
    }
}
