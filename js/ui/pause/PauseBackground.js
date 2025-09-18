Sunniesnow.PauseBackground = class PauseBackground extends PIXI.Container {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const unit = Sunniesnow.Config.WIDTH / 8;
		const graphics = new PIXI.GraphicsContext();
		graphics.rect(0, -unit, Sunniesnow.Config.WIDTH, unit * 2);
		graphics.fill({color: 0x000000, alpha: 0.5});
		return graphics;
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'pause-background';
		this.background = new PIXI.Graphics(this.constructor.geometry);
		this.background.label = 'background';
		this.background.y = Sunniesnow.Config.HEIGHT / 2;
		this.addChild(this.background);
	}
};
