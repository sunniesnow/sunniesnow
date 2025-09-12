Sunniesnow.UiGrid = class UiGrid extends Sunniesnow.UiBgPattern {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		const unit = Sunniesnow.Config.RADIUS * 2 * Sunniesnow.Config.SCALE;
		const rightMost = 4;
		const upMost = 2;
		const halfWidth = rightMost * unit;
		const halfHeight = upMost * unit;
		const margin = unit / 10;
		graphics.rect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
		graphics.fill({color: 0x000000, alpha: 0.2});
		for (let i = -rightMost; i <= rightMost; i += 1) {
			const x = i * unit;
			graphics.moveTo(x, -halfHeight - margin);
			graphics.lineTo(x, halfHeight + margin);
		}
		for (let i = -upMost; i <= upMost; i += 1) {
			const y = i * unit;
			graphics.moveTo(-halfWidth - margin, y);
			graphics.lineTo(halfWidth + margin, y);
		}
		graphics.stroke({width: unit / 50, color: 0xffffef});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = `grid-${this.event.id}`;
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
