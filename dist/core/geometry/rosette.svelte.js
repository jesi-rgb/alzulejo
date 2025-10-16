import { Point, Edge } from "./point.svelte";
import { Polygon } from "./polygon.svelte";
class GraphEdge {
    start;
    end;
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    otherEnd(v) {
        return v === this.start ? this.end : this.start;
    }
}
export class Rosette {
    static calculateInnerRadius(r, n) {
        return r * (Math.cos(Math.PI / n) - Math.sin(Math.PI / n) * Math.tan((Math.PI * (n - 2)) / (4 * n)));
    }
    static transform(polygons) {
        const graph = new PlanarGraph();
        return PlanarGraph.transform(polygons, graph);
    }
}
class PlanarGraph {
    vertices;
    edges;
    vertexAncestors;
    originalEdges;
    constructor() {
        this.vertices = new Map();
        this.edges = [];
        this.vertexAncestors = new Map();
        this.originalEdges = new Map();
    }
    getIncidentEdges(v) {
        return this.edges.filter(e => e.start === v || e.end === v);
    }
    sortEdgesAround(v) {
        const incidentEdges = this.getIncidentEdges(v);
        const sortedEdges = incidentEdges.sort((a, b) => {
            const p1 = a.otherEnd(v);
            const p2 = b.otherEnd(v);
            const aAngle = Math.atan2(p1.y - v.y, p1.x - v.x);
            const bAngle = Math.atan2(p2.y - v.y, p2.x - v.x);
            return aAngle - bAngle;
        });
        return sortedEdges;
    }
    static transform(polygons, graph) {
        for (const p of polygons) {
            if (p.sides >= 5) {
                PlanarGraph.addRegularPolygon(graph, p);
            }
            else {
                PlanarGraph.addIrregularPolygon(graph, p);
            }
        }
        graph.mergeCollinearEdges();
        const vertices = graph.findFaces();
        const newPolygons = graph.assemblePolygons(vertices, polygons);
        return newPolygons;
    }
    getVertex(v) {
        return this.vertices.get(`${Math.round(v.x * 1000)},${Math.round(v.y * 1000)}`);
    }
    findFaces() {
        const faces = [];
        const visitedDirectedEdges = new Set();
        const pointKey = (p) => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)}`;
        const pointsEqual = (p1, p2) => pointKey(p1) === pointKey(p2);
        const normalizeFace = (face) => {
            const keys = face.map(pointKey);
            let minRotation = keys;
            for (let i = 1; i < keys.length; i++) {
                const rotation = [...keys.slice(i), ...keys.slice(0, i)];
                if (rotation.join(',') < minRotation.join(',')) {
                    minRotation = rotation;
                }
            }
            return minRotation.join('|');
        };
        const seenFaces = new Set();
        for (const edge of this.edges) {
            for (const direction of [true, false]) {
                const startVertex = direction ? edge.start : edge.end;
                const endVertex = direction ? edge.end : edge.start;
                const directedEdgeKey = `${pointKey(startVertex)}→${pointKey(endVertex)}`;
                if (visitedDirectedEdges.has(directedEdgeKey))
                    continue;
                const face = [];
                let currentEdge = edge;
                let currentVertex = this.getVertex(endVertex);
                const startingVertex = this.getVertex(startVertex);
                let cameFrom = startingVertex;
                const maxIterations = 50;
                let iterations = 0;
                face.push(startingVertex);
                while (iterations < maxIterations) {
                    iterations++;
                    if (pointsEqual(currentVertex, startingVertex)) {
                        const faceSignature = normalizeFace(face);
                        if (!seenFaces.has(faceSignature)) {
                            seenFaces.add(faceSignature);
                            faces.push(face);
                        }
                        break;
                    }
                    const currentDirectedEdgeKey = `${pointKey(cameFrom)}→${pointKey(currentVertex)}`;
                    visitedDirectedEdges.add(currentDirectedEdgeKey);
                    const sortedEdges = this.sortEdgesAround(currentVertex);
                    face.push(currentVertex);
                    const incomingEdgeIndex = sortedEdges.findIndex(e => {
                        const other = e.otherEnd(currentVertex);
                        return pointsEqual(other, cameFrom);
                    });
                    const nextEdge = sortedEdges[(incomingEdgeIndex + 1) % sortedEdges.length];
                    cameFrom = currentVertex;
                    currentVertex = this.getVertex(nextEdge.otherEnd(currentVertex));
                    currentEdge = nextEdge;
                }
            }
        }
        return faces;
    }
    assemblePolygons(vertexGroupings, ancestorPolygons) {
        const pointKey = (p) => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)}`;
        return vertexGroupings.filter(g => g.length >= 3).map(vertices => {
            const p = new Polygon(vertices);
            const ancestorCounts = new Map();
            for (const vertex of vertices) {
                const ancestor = this.vertexAncestors.get(pointKey(vertex));
                if (ancestor) {
                    ancestorCounts.set(ancestor, (ancestorCounts.get(ancestor) || 0) + 1);
                }
            }
            let mostCommonAncestor;
            let maxCount = 0;
            for (const [ancestor, count] of ancestorCounts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonAncestor = ancestor;
                }
            }
            if (mostCommonAncestor) {
                p.contactAngle = mostCommonAncestor.contactAngle;
                p.style = mostCommonAncestor.style;
                p.motifColor = mostCommonAncestor.motifColor;
                p.ancestorOriginalEdges = this.originalEdges.get(mostCommonAncestor) || null;
            }
            else if (ancestorPolygons.length > 0) {
                p.contactAngle = ancestorPolygons[0].contactAngle;
                p.style = ancestorPolygons[0].style;
                p.motifColor = ancestorPolygons[0].motifColor;
            }
            return p;
        });
    }
    static addRegularPolygon(graph, p) {
        graph.originalEdges.set(p, p.edges.map(e => new Edge(e.start, e.end)));
        const r = Rosette.calculateInnerRadius(p.radius, p.sides);
        const newP = Polygon.regular(p.sides, r, p.centerX, p.centerY).rotate(Math.PI / p.sides);
        newP.style = p.style;
        newP.motifColor = p.motifColor;
        newP.contactAngle = p.contactAngle;
        const innerVertices = [];
        const outerVertices = [];
        for (let i = 0; i < p.sides; i++) {
            innerVertices.push(graph.addVertex(newP.vertices[i], p));
            outerVertices.push(graph.addVertex(p.midpoints[i], p));
        }
        for (let i = 0; i < p.sides; i++) {
            const nextI = (i + 1) % p.sides;
            graph.addEdge(outerVertices[i], innerVertices[i]);
            graph.addEdge(innerVertices[i], innerVertices[nextI]);
        }
    }
    static addIrregularPolygon(graph, p) {
        const center = graph.addVertex(p.center, p);
        const ancestor = PlanarGraph.findAncestor(p, graph.vertexAncestors);
        const ancestorOriginalEdges = ancestor ? graph.originalEdges.get(ancestor) : null;
        for (const edge of p.edges) {
            let contactPoint = edge.midpoint;
            if (ancestorOriginalEdges) {
                contactPoint = PlanarGraph.findBestContactPoint(edge, ancestorOriginalEdges, p.center, edge.midpoint);
            }
            const outer = graph.addVertex(contactPoint, p);
            graph.addEdge(outer, center);
        }
    }
    addVertex(point, ancestor) {
        const key = `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`;
        if (!this.vertices.has(key)) {
            this.vertices.set(key, point);
            if (ancestor) {
                this.vertexAncestors.set(key, ancestor);
            }
        }
        return this.vertices.get(key);
    }
    addEdge(start, end) {
        this.edges.push(new GraphEdge(start, end));
    }
    static findAncestor(p, vertexAncestors) {
        const pointKey = (point) => `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`;
        const ancestorCounts = new Map();
        for (const vertex of p.vertices) {
            const ancestor = vertexAncestors.get(pointKey(vertex));
            if (ancestor) {
                ancestorCounts.set(ancestor, (ancestorCounts.get(ancestor) || 0) + 1);
            }
        }
        let mostCommonAncestor = null;
        let maxCount = 0;
        for (const [ancestor, count] of ancestorCounts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonAncestor = ancestor;
            }
        }
        return mostCommonAncestor;
    }
    static findBestContactPoint(edge, originalEdges, center, defaultMidpoint) {
        const distance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        let bestPoint = defaultMidpoint;
        const midpointToCenter = distance(defaultMidpoint, center);
        for (const originalEdge of originalEdges) {
            const intersection = edge.intersect(originalEdge);
            if (intersection) {
                const intersectionToCenter = distance(intersection, center);
                if (intersectionToCenter < midpointToCenter) {
                    bestPoint = intersection;
                }
            }
        }
        return bestPoint;
    }
    mergeCollinearEdges() {
        const pointKey = (p) => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)}`;
        const areCollinear = (p1, p2, p3) => {
            const EPSILON = 1e-3;
            const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
            return Math.abs(crossProduct) < EPSILON;
        };
        const isBetween = (p, a, b) => {
            const EPSILON = 1e-3;
            const dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
            const squaredLength = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
            if (squaredLength < EPSILON)
                return false;
            const t = dotProduct / squaredLength;
            return t > EPSILON && t < (1 - EPSILON);
        };
        let changed = true;
        let iterations = 0;
        const maxIterations = this.vertices.size * 2;
        while (changed && iterations < maxIterations) {
            iterations++;
            changed = false;
            const vertexEdges = new Map();
            for (const edge of this.edges) {
                const startKey = pointKey(edge.start);
                const endKey = pointKey(edge.end);
                if (!vertexEdges.has(startKey))
                    vertexEdges.set(startKey, []);
                if (!vertexEdges.has(endKey))
                    vertexEdges.set(endKey, []);
                vertexEdges.get(startKey).push(edge);
                vertexEdges.get(endKey).push(edge);
            }
            for (const [vKey, edges] of vertexEdges.entries()) {
                if (edges.length !== 2)
                    continue;
                const v = this.vertices.get(vKey);
                if (!v)
                    continue;
                const edge1 = edges[0];
                const edge2 = edges[1];
                const p1 = edge1.otherEnd(v);
                const p2 = edge2.otherEnd(v);
                if (areCollinear(p1, v, p2) && isBetween(v, p1, p2)) {
                    const newEdge = new GraphEdge(p1, p2);
                    this.edges = this.edges.filter(e => e !== edge1 && e !== edge2);
                    this.edges.push(newEdge);
                    this.vertices.delete(vKey);
                    changed = true;
                    break;
                }
            }
        }
    }
}
