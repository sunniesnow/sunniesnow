Sunniesnow.UiHexagram = class UiHexagram extends Sunniesnow.UiBgPattern {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		const unit = Sunniesnow.Config.RADIUS * 2 * Sunniesnow.Config.SCALE;
		const thickness = unit / 20;
		graphics.beginFill(0x000000, 0.2);
		const polygon = [];
		for (let i = 0; i < 12; i++) {
			const r = i % 2 ? unit*2 : unit*2/Math.sqrt(3);
			const angle = i * Math.PI / 6;
			polygon.push(r*Math.cos(angle), r*Math.sin(angle));
		}
		graphics.drawPolygon(polygon);
		graphics.endFill();
		graphics.lineStyle(thickness, 0xffffef, 1, 1);
		graphics.drawRegularPolygon(0, 0, unit*2, 3);
		graphics.drawRegularPolygon(0, 0, unit*2, 3, Math.PI);
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
