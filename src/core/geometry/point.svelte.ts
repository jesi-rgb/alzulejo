export class Point {
	x = $state(0);
	y = $state(0);

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}
