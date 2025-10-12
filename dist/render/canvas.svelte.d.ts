export interface CanvasConfig {
    width?: number;
    height?: number;
    pixelRatio?: number;
}
export declare class Canvas {
    private config;
    private renderables;
    private renderScheduled;
    private currentBackgroundColor;
    private animationStartTime;
    private isAnimating;
    private animationFrameId;
    animationDuration: number;
    staggerDelay: number;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    isReady: boolean;
    width: () => number;
    height: () => number;
    constructor(config?: CanvasConfig);
    private scheduleRender;
    setup(canvasElement: HTMLCanvasElement): void;
    updateSize(): void;
    private setupHighDPI;
    private performDraw;
    add(renderable: {
        draw: (ctx: CanvasRenderingContext2D, ...args: any[]) => void;
        backgroundColor?: string;
        polygons?: any[];
    }, ...drawArgs: any[]): void;
    update(renderable: {
        draw: (ctx: CanvasRenderingContext2D, ...args: any[]) => void;
        backgroundColor?: string;
        polygons?: any[];
    }, ...drawArgs: any[]): void;
    clear(backgroundColor?: string): void;
    clearRenderables(): void;
    withStyle(style: Partial<CanvasRenderingContext2D>, drawFn: (ctx: CanvasRenderingContext2D) => void): void;
    static computeColor(color: string): string;
    static applyOpacity(color: string, opacity: number, ctx: CanvasRenderingContext2D): string;
    private startAnimationLoop;
    getAnimationProgress(shapeIndex: number, totalShapes: number): number;
}
