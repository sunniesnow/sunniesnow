Sunniesnow.UiCheckerboard = class UiCheckerboard extends Sunniesnow.UiBgPattern {
	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		const unit = Sunniesnow.Config.radius * 2 * Sunniesnow.Config.scale();
		const rowCount = 4;
		const columnCount = 4;
		for (let i = 0; i < rowCount; i++) {
			for (let j = 0; j < columnCount; j++) {
				graphics.beginFill((i + j) % 2 ? 0x000000 : 0xffffff, 0.4);
				graphics.drawRect((i-rowCount/2) * unit, (j-columnCount/2) * unit, unit, unit);
				graphics.endFill();
			}
		}
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
