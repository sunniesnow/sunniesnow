Sunniesnow.DoubleLine = class DoubleLine extends Sunniesnow.DoubleLineBase {

	static async load() {
		this.radius = Sunniesnow.Config.noteRadius();
	}

	populate() {
		this.dx = this.x2 - this.x1;
		this.dy = this.y2 - this.y1;

		this.graphics = new PIXI.Graphics();
		this.graphics.x = this.x1;
		this.graphics.y = this.y1;
		this.addChild(this.graphics);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.graphics.visible = true;
		this.graphics.clear();
		this.graphics.lineStyle(Sunniesnow.DoubleLine.radius / 12, 0xf9f9e9);
		Sunniesnow.Utils.drawDashedLine(
			this.graphics,
			(1-progress) * this.dx / 2,
			(1-progress) * this.dy / 2,
			(1+progress) * this.dx / 2,
			(1+progress) * this.dy / 2,
			this.constructor.radius / 4,
			this.constructor.radius / 4
		);
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.graphics.visible = true;
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.graphics.visible = false;
	}
};
