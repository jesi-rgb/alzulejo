type StyleType = {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    motifColor?: string;
};
export declare class Style implements StyleType {
    fill: string;
    fillOpacity: number;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    motifColor: string;
    constructor(fill?: string, fillOpacity?: number, stroke?: string, strokeWidth?: number, strokeOpacity?: number, motifColor?: string);
}
export {};
