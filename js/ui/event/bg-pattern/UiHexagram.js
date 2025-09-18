Sunniesnow.UiHexagram = class UiHexagram extends Sunniesnow.UiBgPattern {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		const unit = Sunniesnow.Config.RADIUS * 2 * Sunniesnow.Config.SCALE;
		const thickness = unit / 20;
		const polygon = [];
		for (let i = 0; i < 12; i++) {
			const r = i % 2 ? unit*2 : unit*2/Math.sqrt(3);
			const angle = i * Math.PI / 6;
			polygon.push(r*Math.cos(angle), r*Math.sin(angle));
		}
		graphics.poly(polygon);
		graphics.fill({color: 0x000000, alpha: 0.2});
		graphics.regularPoly(0, 0, unit*2, 3);
		graphics.regularPoly(0, 0, unit*2, 3, Math.PI);
		graphics.stroke({width: thickness, color: 0xffffef, alignment: 0});
		graphics.circle(0, 0, thickness / 2);
		graphics.stroke({width: thickness, color: 0xffffef});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = `hexagram-${this.event.id}`;
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
