Sunniesnow.UiPentagon = class UiPentagon extends Sunniesnow.UiBgPattern {
	static initialize() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		const unit = Sunniesnow.Config.radius * 2 * Sunniesnow.Config.scale();
		const thickness = unit / 20;
		graphics.lineStyle(thickness, 0xffffef, 1);
		graphics.beginFill(0x000000, 0.2)
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, unit * 2, 5, -Math.PI/2);
		graphics.endFill();
		graphics.drawCircle(0, 0, thickness / 2);
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.pattern = new PIXI.Graphics(this.constructor.geometry);
		this.addChild(this.pattern);
	}

	updateFadingIn(progress) {
		super.updateFadingIn(progress);
		this.pattern.alpha = progress;
		this.pattern.scale.set(progress);
	}

	updateHolding(progress) {
		super.updateHolding(progress);
		this.pattern.alpha = 1;
		this.pattern.scale.set(1);
	}

	updateFadingOut(progress) {
		super.updateFadingOut(progress);
		this.pattern.alpha = 1 - progress;
	}
};
