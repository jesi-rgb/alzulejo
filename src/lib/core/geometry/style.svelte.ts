
export class Style {
	fill = $state('blue');
	fillOpacity = $state(1);
	stroke = $state('black');
	strokeWidth = $state(1);
	strokeOpacity = $state(1);
	motifColor = $state('purple');

	constructor(
		fill: string,
		fillOpacity: number,
		stroke: string,
		strokeWidth: number,
		strokeOpacity: number,
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
