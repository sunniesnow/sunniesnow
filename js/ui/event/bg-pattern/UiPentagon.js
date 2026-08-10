Sunniesnow.UiPentagon = class UiPentagon extends Sunniesnow.UiBgPattern {
	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		const unit = Sunniesnow.Config.NOTE_RADIUS * 2;
		const thickness = unit / 20;
		const radius = 4 * unit / (1 + Math.cos(Math.PI / 5));
		graphics.regularPoly(0, -2 * unit + radius, radius, 5);
		graphics.fill({color: 0x000000, alpha: 0.2});
		graphics.stroke({width: thickness, color: 0xffffef});
		graphics.circle(0, 0, thickness / 2);
		graphics.stroke({width: thickness, color: 0xffffef});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = `pentagon-${this.event.id}`;
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
