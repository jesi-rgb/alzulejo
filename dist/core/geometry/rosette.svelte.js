import { Tessellation } from "./tessellation.svelte";
export class RosetteTransform {
    tessellation;
    constructor(t) {
        this.tessellation = t;
    }
    calculateInnerRadius(r, n) {
        return r * (Math.cos(Math.PI / n) - Math.sin(Math.PI / n) * Math.tan((Math.PI * (n - 2)) / (4 * n)));
    }
    applyIrregularTransform(p) {
        const r = this.calculateInnerRadius(p.radius, p.sides);
        return p;
    }
    applyRegularTransform(p) {
        return p;
    }
    applyPolygonTransform(p) {
        if (p.sides >= 5) {
            return this.applyRegularTransform(p);
        }
        else {
            return this.applyIrregularTransform(p);
        }
    }
}
