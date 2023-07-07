Sunniesnow.UiGrid = class UiGrid extends Sunniesnow.UiBgPattern {

	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		const unit = Sunniesnow.Config.radius * 2 * Sunniesnow.Config.scale();
		const rightMost = 4;
		const upMost = 2;
		const halfWidth = rightMost * unit;
		const halfHeight = upMost * unit;
		const margin = unit / 10;
		graphics.beginFill(0x000000, 0.2);
		graphics.drawRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
		graphics.endFill();
		graphics.lineStyle(unit / 50, 0xffffef);
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
		graphics.finishPoly();
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
