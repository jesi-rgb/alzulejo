export interface TileDefinition {
    polygonType: 'triangle' | 'square' | 'hexagon' | 'octagon';
    relativeSize: number;
    rotation?: number;
    styleKey?: 'default' | 'style1' | 'style2' | 'style3';
}
export interface TilePosition extends TileDefinition {
    x: number;
    y: number;
}
export interface Bounds {
    width: number;
    height: number;
}
export interface UnitDimensions {
    width: number;
    height: number;
}
