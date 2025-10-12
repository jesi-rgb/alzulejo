import type { Polygon } from "./polygon.svelte";
import { Tessellation } from "./tessellation.svelte";

export class RosetteTransform {

	tessellation: Tessellation;

	constructor(t: Tessellation) {
		this.tessellation = t;
	}



	private calculateInnerRadius(r: number, n: number): number {
		return r * (Math.cos(Math.PI / n) - Math.sin(Math.PI / n) * Math.tan((Math.PI * (n - 2)) / (4 * n)));
	}

	private applyIrregularTransform(p: Polygon): Polygon {

		const r = this.calculateInnerRadius(p.radius, p.sides);
		return p;
	}

	private applyRegularTransform(p: Polygon): Polygon {
		return p;
	}

	applyPolygonTransform(p: Polygon): Polygon {
		if (p.sides >= 5) {
			return this.applyRegularTransform(p);
		} else {
			return this.applyIrregularTransform(p);
		}
	}

}
