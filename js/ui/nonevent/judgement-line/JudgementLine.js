Sunniesnow.JudgementLine = class JudgementLine extends Sunniesnow.JudgementLineBase {

	static async load() {
		await super.load();
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		graphics.moveTo(0, Sunniesnow.Config.SCROLL_END_Y);
		graphics.lineTo(Sunniesnow.Config.WIDTH, Sunniesnow.Config.SCROLL_END_Y);
		graphics.stroke({width: Sunniesnow.Config.HEIGHT / 120, color: 0xffffff, alpha: 0.8});
		return graphics;
	}

	populate() {
		super.populate();
		this.line = new PIXI.Graphics(this.constructor.geometry);
		this.addChild(this.line);
	}

};
