Sunniesnow.JudgementLine = class JudgementLine extends Sunniesnow.JudgementLineBase {

	static async load() {
		await super.load();
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(Sunniesnow.Config.HEIGHT / 120, 0xffffff, 0.8);
		graphics.moveTo(0, Sunniesnow.Config.SCROLL_END_Y);
		graphics.lineTo(Sunniesnow.Config.WIDTH, Sunniesnow.Config.SCROLL_END_Y);
		graphics.finishPoly();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.line = new PIXI.Graphics(this.constructor.geometry);
		this.addChild(this.line);
	}

};
