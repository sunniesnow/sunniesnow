Sunniesnow.TouchEffectBase = class TouchEffectBase extends PIXI.Container {

	static async load() {
	}

	constructor(touch) {
		super();
		this.state = 'present'; // present -> finished
		this.touch = touch;
		this.populate();
		const {x, y} = touch.start();
		[this.x, this.y] = Sunniesnow.Config.chartMapping(x, y);
	}

	populate() {
	}

	update(delta) {
		this.state = 'finished';
	}

};
