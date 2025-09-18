Sunniesnow.UiHexagon = class UiHexagon extends Sunniesnow.UiBgPattern {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		const unit = Sunniesnow.Config.RADIUS * 2 * Sunniesnow.Config.SCALE;
		const thickness = unit / 20;
		graphics.regularPoly(0, 0, unit*4/Math.sqrt(3), 6, Math.PI / 2);
		graphics.fill({color: 0x000000, alpha: 0.2});
		graphics.stroke({width: thickness, color: 0xffffef, alignment: 0});
		graphics.regularPoly(0, 0, unit * 2, 6);
		graphics.regularPoly(0, 0, unit*Math.sqrt(3), 6, Math.PI / 2);
		graphics.stroke({width: unit / 50, color: 0xffffef, alpha: 0.7});
		graphics.circle(0, 0, thickness / 2);
		graphics.stroke({width: thickness, color: 0xffffef, alpha: 1});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = `hexagon-${this.event.id}`;
		this.pattern = new PIXI.Graphics(this.constructor.geometry);
		this.pattern.label = 'pattern';
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
