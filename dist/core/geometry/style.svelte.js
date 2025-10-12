export class Style {
    fill = 'blue';
    fillOpacity = $state(1);
    stroke = $state('black');
    strokeWidth = $state(1);
    strokeOpacity = $state(1);
    motifColor = $state('purple');
    constructor(fill = 'aquamarine', fillOpacity = 1, stroke = 'black', strokeWidth = 1, strokeOpacity = 1, motifColor = 'purple') {
        this.fill = fill;
        this.fillOpacity = fillOpacity;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
        this.strokeOpacity = strokeOpacity;
        this.motifColor = motifColor;
    }
}
