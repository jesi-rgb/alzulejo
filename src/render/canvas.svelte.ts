export interface CanvasConfig {
	width?: number;
	height?: number;
	pixelRatio?: number;
}

export class Canvas {
	canvas = $state<HTMLCanvasElement | null>(null);
	ctx = $state<CanvasRenderingContext2D | null>(null);
	isReady = $derived(this.canvas !== null && this.ctx !== null);

	private renderables = $state<(() => void)[]>([]);

	constructor(private config: CanvasConfig = {}) {
		// Auto-redraw effect
		$effect(() => {
			if (this.isReady) {
				this.performDraw();
			}
		});
	}

	setup(canvasElement: HTMLCanvasElement) {
		this.canvas = canvasElement;
		this.setupHighDPI();
		this.ctx = this.canvas.getContext('2d');
	}

	private setupHighDPI() {
		if (!this.canvas) return;

		const dpr = this.config.pixelRatio ?? window.devicePixelRatio ?? 1;
		const rect = this.canvas.getBoundingClientRect();

		const width = this.config.width ?? rect.width;
		const height = this.config.height ?? rect.height;

		this.canvas.width = width * dpr;
		this.canvas.height = height * dpr;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';

		const ctx = this.canvas.getContext('2d');
		if (ctx) {
			ctx.scale(dpr, dpr);
		}
	}

	clearCanvas() {
		if (!this.ctx || !this.canvas) return;

		const rect = this.canvas.getBoundingClientRect();
		this.ctx.clearRect(0, 0, rect.width, rect.height);
	}

	private performDraw() {
		if (!this.isReady) return;

		this.clearCanvas();
		this.renderables.forEach(render => render());
	}

	// Add a renderable object that draws itself
	add(renderable: { draw: (ctx: CanvasRenderingContext2D) => void }) {
		this.renderables.push(() => renderable.draw(this.ctx!));
	}

	// Remove all renderables
	clear() {
		if (!this.ctx || !this.canvas) return;

		const rect = this.canvas.getBoundingClientRect();
		this.ctx.clearRect(0, 0, rect.width, rect.height);
	}

	// Clear renderables list
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
}

export function createCanvas(config?: CanvasConfig) {
	return new Canvas(config);
}

// Removed - no longer needed with automatic reactivity
