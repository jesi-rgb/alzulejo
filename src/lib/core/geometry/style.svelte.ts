
type StyleType = {
	fill?: string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
	motifColor?: string;
}

export class Style implements StyleType {
	fill = 'blue'
	fillOpacity = $state(1);
	stroke = $state('black');
	strokeWidth = $state(1);
	strokeOpacity = $state(1);
	motifColor = $state('purple');

	constructor(
		fill: string = 'aquamarine',
		fillOpacity: number = 1,
		stroke: string = 'black',
		strokeWidth: number = 1,
		strokeOpacity: number = 1,
		motifColor: string = 'purple',
	) {
		this.fill = fill;
		this.fillOpacity = fillOpacity;
		this.stroke = stroke;
		this.strokeWidth = strokeWidth;
		this.strokeOpacity = strokeOpacity;
		this.motifColor = motifColor;
	}
}
