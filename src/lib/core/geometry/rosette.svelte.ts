import { Point } from "./point.svelte";
import { Polygon } from "./polygon.svelte";

class GraphEdge {
	start: Point;
	end: Point;

	constructor(start: Point, end: Point) {
		this.start = start;
		this.end = end;
	}

	otherEnd(v: Point): Point {
		return v === this.start ? this.end : this.start;
	}
}

export class Rosette {
	static calculateInnerRadius(r: number, n: number): number {
		return r * (Math.cos(Math.PI / n) - Math.sin(Math.PI / n) * Math.tan((Math.PI * (n - 2)) / (4 * n)));
	}

	static transform(polygons: Polygon[]): Polygon[] {
		const graph = new PlanarGraph();
		return PlanarGraph.transform(polygons, graph);
	}

}


class PlanarGraph {
	vertices: Map<string, Point>;
	edges: GraphEdge[];

	constructor() {
		this.vertices = new Map();
		this.edges = [];
	}

	getIncidentEdges(v: Point): GraphEdge[] {
		return this.edges.filter(e => e.start === v || e.end === v);
	}

	sortEdgesAround(v: Point): GraphEdge[] {
		const incidentEdges = this.getIncidentEdges(v);

		const sortedEdges = incidentEdges.sort((a, b) => {
			const p1 = a.otherEnd(v);
			const p2 = b.otherEnd(v);

			const aAngle = Math.atan2(p1.y - v.y, p1.x - v.x);
			const bAngle = Math.atan2(p2.y - v.y, p2.x - v.x);
			return aAngle - bAngle;
		});

		return sortedEdges

	}

	static transform(polygons: Polygon[], graph: PlanarGraph): Polygon[] {
		for (const p of polygons) {
			if (p.sides >= 5) {
				// add regular polygon
				PlanarGraph.addRegularPolygon(graph, p);
			}
			else {
				// add irregular polygon
				PlanarGraph.addIrregularPolygon(graph, p);
			}
		}

		const vertices = graph.findFaces();
		const newPolygons = graph.assemblePolygons(vertices);
		return newPolygons;
	}


	findFaces(): Point[][] {
		const faces: Point[][] = [];

		for (const edge of this.edges) {
			const face: Point[] = [];
			let currentEdge = edge;
			let currentVertex = edge.end;
			const startingVertex = edge.start;
			const maxIterations = 1000;
			let iterations = 0;

			face.push(startingVertex);

			while (iterations < maxIterations) {
				iterations++;

				face.push(currentVertex);

				if (currentVertex === startingVertex) {
					face.pop()
					faces.push(face);
					break
				}

				const sortedEdges = this.sortEdgesAround(currentVertex);
				const indexOfCurrentEdge = sortedEdges.indexOf(currentEdge)

				const nextEdge = sortedEdges[(indexOfCurrentEdge + 1) % sortedEdges.length];

				currentVertex = nextEdge.otherEnd(currentVertex);
				currentEdge = nextEdge;

			}
		}

		return faces;

	}
	assemblePolygons(vertexGroupings: Point[][]): Polygon[] {
		return vertexGroupings.filter(g => g.length >= 3).map(vertices => {
			const p = new Polygon(vertices);
			return p
		})
	}

	static addRegularPolygon(graph: PlanarGraph, p: Polygon): void {
		const r = Rosette.calculateInnerRadius(p.radius, p.sides);
		const newP = Polygon.regular(p.sides, r, p.centerX, p.centerY).rotate(Math.PI / p.sides);

		newP.style = p.style;
		newP.motifColor = p.motifColor;
		newP.contactAngle = p.contactAngle;

		for (let i = 0; i < p.sides; i++) {
			const midpoint = p.midpoints[i];
			const innerVertex = newP.vertices[i];
			const nextInnerVertex = newP.vertices[(i + 1) % p.sides];
			const nextMidpoint = p.midpoints[(i + 1) % p.sides];

			const outer = graph.addVertex(midpoint);
			const inner = graph.addVertex(innerVertex);
			const nextInner = graph.addVertex(nextInnerVertex);
			const nextOuter = graph.addVertex(nextMidpoint);

			graph.addEdge(outer, inner);
			graph.addEdge(inner, nextInner);
			graph.addEdge(nextInner, nextOuter);
		}
	}

	static addIrregularPolygon(graph: PlanarGraph, p: Polygon): void {
		const center = graph.addVertex(p.center)

		for (const midpoint of p.midpoints) {
			const outer = graph.addVertex(midpoint);
			graph.addEdge(outer, center);
		}

	}

	addVertex(point: Point): Point {
		const key = `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`;

		if (!this.vertices.has(key)) {
			this.vertices.set(key, point);
		}

		return this.vertices.get(key)!
	}

	addEdge(start: Point, end: Point): void {
		this.edges.push(new GraphEdge(start, end));
	}
}
