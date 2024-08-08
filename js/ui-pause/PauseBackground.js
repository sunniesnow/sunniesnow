Sunniesnow.PauseBackground = class PauseBackground extends Sunniesnow.UiComponent {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const unit = Sunniesnow.Config.WIDTH / 8;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x000000, 0.5);
		graphics.drawRect(0, -unit, Sunniesnow.Config.WIDTH, unit * 2);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.geometry);
		this.background.y = Sunniesnow.Config.HEIGHT / 2;
		this.addChild(this.background);
	}
};
