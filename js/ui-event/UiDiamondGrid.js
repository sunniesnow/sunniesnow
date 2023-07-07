Sunniesnow.UiDiamondGrid = class UiDiamondGrid extends Sunniesnow.UiBgPattern {
	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		const unit = Sunniesnow.Config.radius * 2 * Sunniesnow.Config.scale();
		const margin = unit / 10;
		graphics.lineStyle(unit / 50, 0xffffef);
		const ends = [3, 2, 1, -1];
		const halfSpan = ends.length - 1;
		for (let i = -halfSpan; i <= halfSpan; i++) {
			const x = i * unit*2;
			const start = -ends[Math.max(0, -i)] * unit;
			const end = ends[Math.max(0, i)] * unit;
			graphics.moveTo(x + start - margin, start - margin);
			graphics.lineTo(x + end + margin, end + margin);
			graphics.moveTo(-x - start + margin, start - margin);
			graphics.lineTo(-x - end - margin, end + margin);
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
