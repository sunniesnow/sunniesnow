Sunniesnow.UiTurntable = class UiTurntable extends Sunniesnow.UiBgPattern {
	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		const unit = Sunniesnow.Config.RADIUS * 2 * Sunniesnow.Config.SCALE;
		const thickness = unit / 20;
		graphics.circle(0, 0, unit * 2);
		graphics.fill({color: 0x000000, alpha: 0.2});
		graphics.stroke({width: thickness, color: 0xffffef});
		graphics.circle(0, 0, unit);
		graphics.stroke({width: thickness, color: 0xffffef});
		graphics.circle(0, 0, thickness / 2);
		graphics.stroke({width: thickness, color: 0xffffef});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = `turntable-${this.event.id}`;
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
