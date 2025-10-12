export class Style {
    fill = 'blue';
    fillOpacity = $state(1);
    stroke = $state('black');
    strokeWidth = $state(1);
    strokeOpacity = $state(1);
    motifColor = $state('purple');
    constructor(fill, fillOpacity, stroke, strokeWidth, strokeOpacity, motifColor) {
        this.fill = fill ?? 'aquamarine';
        this.fillOpacity = fillOpacity ?? 1;
        this.stroke = stroke ?? 'black';
        this.strokeWidth = strokeWidth ?? 1;
        this.strokeOpacity = strokeOpacity ?? 1;
        this.motifColor = motifColor ?? 'purple';
    }
}
