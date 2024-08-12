Sunniesnow.UiDrag = class UiDrag extends Sunniesnow.UiNote {

	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS * 2/3;
		this.geometry = this.createGeometry();
		this.circleRadius = this.radius * 6;
		this.circleGeometry = this.createCircleGeometry();
	}

	static createCircleGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.circleRadius / 24, 0xccfcfc, 1, 0);
		graphics.drawCircle(0, 0, this.circleRadius);
		return graphics.geometry;
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 8, 0xfcfc7c, 1, 0);
		graphics.drawCircle(0, 0, this.radius);
		const smallerRadius = this.radius * 2/3;
		graphics.drawCircle(0, 0, smallerRadius);
		const unit1 = smallerRadius / Math.sqrt(2);
		const unit2 = this.radius / Math.sqrt(2);
		graphics.moveTo(-unit1, unit1);
		graphics.lineTo(-unit2, unit2);
		graphics.moveTo(unit1, -unit1);
		graphics.lineTo(unit2, -unit2);
		graphics.finishPoly();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.note = new PIXI.Graphics(this.constructor.geometry);
		this.addChild(this.note);
	}

	populateCircle() {
		this.circle = new PIXI.Graphics(this.constructor.circleGeometry);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.scale.set(progress);
		if (!this.circle) {
			return;
		}
		this.circle.scale.set(1 - (progress-1)**2);
		this.circle.alpha = progress / 3;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.scale.set(1);
		if (!this.circle) {
			return;
		}
		const targetCircleScale = this.constructor.radius / this.constructor.circleRadius;
		if (progress <= 1) {
			this.circle.visible = true;
			this.circle.scale.set(1 - (1-targetCircleScale) * progress);
			this.circle.alpha = (1/3 + 2/3 * progress);
		} else {
			this.circle.visible = false;
		}
	}

	static fadingOutDuration(event) {
		return 0;
	}
};
