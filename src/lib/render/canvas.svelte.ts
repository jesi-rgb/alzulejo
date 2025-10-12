export interface CanvasConfig {
	width?: number;
	height?: number;
	pixelRatio?: number;
}

export class Canvas {
	private renderables = $state<(() => void)[]>([]);
	private renderScheduled = false;
	private currentBackgroundColor = $state<string | undefined>(undefined);
	private animationStartTime: number | null = null;
	private isAnimating = false;
	private animationFrameId: number | null = null;

	animationDuration = $state(400);
	staggerDelay = $state(400);

	canvas = $state<HTMLCanvasElement | null>(null);
	ctx = $state<CanvasRenderingContext2D | null>(null);
	isReady = $derived(this.canvas !== null && this.ctx !== null);

	width = $derived(() => this.canvas?.getBoundingClientRect().width ?? 0);
	height = $derived(() => this.canvas?.getBoundingClientRect().height ?? 0);


	constructor(private config: CanvasConfig = {}) {
		// Throttled auto-redraw effect
		$effect(() => {
			if (this.isReady && !this.renderScheduled) {
				// Trigger when canvas is ready OR when renderables change
				this.renderables.length;
				this.scheduleRender();
			}
		});
	}

	private scheduleRender() {
		if (this.renderScheduled) return;

		this.renderScheduled = true;
		requestAnimationFrame(() => {
			this.performDraw();
			this.renderScheduled = false;
		})
	}

	setup(canvasElement: HTMLCanvasElement) {
		this.canvas = canvasElement;
		this.setupHighDPI();
		this.ctx = this.canvas.getContext('2d');
	}

	updateSize() {
		this.setupHighDPI();
	}

	private setupHighDPI() {
		if (!this.canvas) return;

		const dpr = this.config.pixelRatio ?? window.devicePixelRatio ?? 1;
		const rect = this.canvas.getBoundingClientRect();

		// Always use CSS dimensions, ignore config
		const width = rect.width;
		const height = rect.height;

		this.canvas.width = width * dpr;
		this.canvas.height = height * dpr;

		const ctx = this.canvas.getContext('2d');
		if (ctx) {
			ctx.lineCap = "round";
			ctx.scale(dpr, dpr);
		}
	}

	private performDraw() {
		if (!this.isReady) return;

		this.clear(this.currentBackgroundColor);
		this.renderables.forEach(render => render());
	}

	add(renderable: { draw: (ctx: CanvasRenderingContext2D, ...args: any[]) => void; backgroundColor?: string; polygons?: any[] }, ...drawArgs: any[]) {
		this.currentBackgroundColor = renderable.backgroundColor;
		this.renderables.push(() => renderable.draw(this.ctx!, ...drawArgs, this));

		this.animationStartTime = performance.now();
		this.isAnimating = true;
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
		}
		this.startAnimationLoop();
	}

	clear(backgroundColor?: string) {
		if (!this.ctx || !this.canvas) return;

		const rect = this.canvas.getBoundingClientRect();

		if (backgroundColor) {
			this.ctx.fillStyle = Canvas.computeColor(backgroundColor);
			this.ctx.fillRect(0, 0, rect.width, rect.height);
		} else {
			this.ctx.clearRect(0, 0, rect.width, rect.height);
		}
	}

	clearRenderables() {
		this.renderables.length = 0;
	}

	withStyle(style: Partial<CanvasRenderingContext2D>, drawFn: (ctx: CanvasRenderingContext2D) => void) {
		if (!this.ctx) return;

		this.ctx.save();
		Object.assign(this.ctx, style);
		drawFn(this.ctx);
		this.ctx.restore();
	}

	static computeColor(color: string): string {
		if (color.startsWith('var(') && color.endsWith(')')) {
			const varName = color.slice(4, -1);
			return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || color;
		}
		return color;
	}

	static applyOpacity(color: string, opacity: number, ctx: CanvasRenderingContext2D): string {
		if (opacity === 1) return color;

		ctx.fillStyle = color;
		const computedColor = ctx.fillStyle;

		if (computedColor.startsWith('#')) {
			const hex = computedColor.slice(1);
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		} else if (computedColor.startsWith('rgb(')) {
			const rgb = computedColor.slice(4, -1);
			return `rgba(${rgb}, ${opacity})`;
		}

		return color;
	}

	private startAnimationLoop() {
		if (!this.isReady) return;

		const animate = () => {
			this.performDraw();

			if (this.isAnimating) {
				this.animationFrameId = requestAnimationFrame(animate);
			}
		};

		this.animationFrameId = requestAnimationFrame(animate);
	}

	getAnimationProgress(shapeIndex: number, totalShapes: number): number {
		if (!this.animationStartTime || !this.isAnimating) return 1;

		const elapsed = performance.now() - this.animationStartTime;
		const delay = (shapeIndex / totalShapes) * this.staggerDelay;
		const shapeElapsed = elapsed - delay;

		if (shapeElapsed <= 0) return 0;
		if (shapeElapsed >= this.animationDuration) {
			if (shapeIndex === totalShapes - 1) {
				this.isAnimating = false;
			}
			return 1;
		}

		return shapeElapsed / this.animationDuration;
	}
}
