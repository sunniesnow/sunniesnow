Sunniesnow.UiDrag = class UiDrag extends Sunniesnow.UiNote {
	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius() * 2/3;
		this.circleRadius = this.radius * 6;
		this.circleGeometry = this.createCircleGeometry();
		this.geometry = this.createGeometry();
	}

	static createCircleGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.circleRadius / 24, 0xeefefe, 1, 0);
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
		this.circle = new PIXI.Graphics(this.constructor.circleGeometry);
		this.addChild(this.circle);
		this.addChild(this.note);
	}

	updateFadingIn(progress) {
		super.updateFadingIn(progress);
		this.note.scale.set(progress);
		this.circle.scale.set(1 - (progress-1)**2);
		this.circle.alpha = progress / 3;
	}

	updateActive(progress) {
		super.updateActive(progress);
		this.note.scale.set(1);
		const targetCircleScale = this.constructor.radius / this.constructor.circleRadius;
		if (progress <= 1) {
			this.circle.visible = true;
			this.circle.scale.set(1 - (1-targetCircleScale) * progress);
			this.circle.alpha = (1/3 + 2/3 * progress);
		} else {
			this.circle.visible = false;
		}
	}
};
