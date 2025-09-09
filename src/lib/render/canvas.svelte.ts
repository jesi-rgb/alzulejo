export interface CanvasConfig {
	width?: number;
	height?: number;
	pixelRatio?: number;
}

export class Canvas {
	private renderables = $state<(() => void)[]>([]);
	private renderScheduled = false;

	canvas = $state<HTMLCanvasElement | null>(null);
	ctx = $state<CanvasRenderingContext2D | null>(null);
	isReady = $derived(this.canvas !== null && this.ctx !== null);

	width = $derived(() => this.canvas?.width ?? 0);
	height = $derived(() => this.canvas?.height ?? 0);


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

		this.performDraw();
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

	private performDraw() {
		if (!this.isReady) return;

		this.clear();
		this.renderables.forEach(render => render());
	}

	add(renderable: { draw: (ctx: CanvasRenderingContext2D) => void }) {
		this.renderables.push(() => renderable.draw(this.ctx!));
	}

	clear() {
		if (!this.ctx || !this.canvas) return;

		const rect = this.canvas.getBoundingClientRect();
		this.ctx.clearRect(0, 0, rect.width, rect.height);
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
}
