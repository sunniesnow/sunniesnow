Sunniesnow.DoubleLine = class DoubleLine extends Sunniesnow.DoubleLineBase {

	static FADING_IN_DURATION = 1/4
	static FADING_OUT_DURATION = 1/3

	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
	}

	populate() {
		this.graphics = new PIXI.Graphics();
		this.addChild(this.graphics);
	}

	drawShape(progress) {
		const dx = this.x2 - this.x1;
		const dy = this.y2 - this.y1;
		this.graphics.x = this.x1;
		this.graphics.y = this.y1;
		this.graphics.clear();
		this.graphics.lineStyle(Sunniesnow.DoubleLine.radius / 12, 0xf9f9e9);
		Sunniesnow.Utils.drawDashedLine(
			this.graphics,
			(1-progress) * dx / 2,
			(1-progress) * dy / 2,
			(1+progress) * dx / 2,
			(1+progress) * dy / 2,
			this.constructor.radius / 4,
			this.constructor.radius / 4
		);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.drawShape(progress);
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.drawShape(1);
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.drawShape(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.graphics.alpha = (1 - progress)**2;
		this.drawShape(1);
	}
};
