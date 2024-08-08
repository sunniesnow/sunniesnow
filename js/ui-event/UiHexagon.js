Sunniesnow.UiHexagon = class UiHexagon extends Sunniesnow.UiBgPattern {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		const unit = Sunniesnow.Config.RADIUS * 2 * Sunniesnow.Config.SCALE;
		const thickness = unit / 20;
		graphics.lineStyle(thickness, 0xffffef, 1, 1);
		graphics.beginFill(0x000000, 0.2)
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, unit*4/Math.sqrt(3), 6, 0);
		graphics.endFill();
		graphics.lineStyle(unit / 50, 0xffffef, 0.7);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, unit * 2, 6, Math.PI / 2);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, unit*Math.sqrt(3), 6, 0);
		graphics.lineStyle(thickness, 0xffffef, 1);
		graphics.drawCircle(0, 0, thickness / 2);
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.pattern = new PIXI.Graphics(this.constructor.geometry);
		this.addChild(this.pattern);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.pattern.alpha = progress;
		this.pattern.scale.set(progress);
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.pattern.alpha = 1;
		this.pattern.scale.set(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.pattern.alpha = 1 - progress;
	}
};
