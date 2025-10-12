export interface Transform {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}
export interface Shape {
    type: 'regular';
    sides: number;
}
export interface Tile {
    shape: Shape;
    transforms: Transform[];
}
export interface Vector {
    x: number;
    y: number;
}
export interface Tiling {
    name: string;
    translations: Vector[];
    tiles: Tile[];
}
export declare const archimedeanTilings: Tiling[];
