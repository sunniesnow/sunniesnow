Sunniesnow.UiDrag = class UiDrag extends Sunniesnow.UiNote {

	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS * 2/3;
		this.geometry = this.createDragBodyGeometry(0xfcfc7c);
		this.circleRadius = this.radius * 6;
		this.circleGeometry = this.createCircleGeometry(0xccfcfc);
	}

	populate() {
		super.populate();
		this.note = new PIXI.Graphics(this.constructor.geometry);
		this.addChild(this.note);
	}

	populateCircle() {
		super.populateCircle();
		this.circleGraphics = new PIXI.Graphics(this.constructor.circleGeometry);
		this.circle.addChild(this.circleGraphics);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.scale.set(progress);
		if (!this.circle) {
			return;
		}
		this.circleGraphics.scale.set(1 - (progress-1)**2);
		this.circleGraphics.alpha = progress / 3;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.scale.set(1);
		this.updateCircle(progress);
	}

	static fadingOutDuration(event) {
		return 0;
	}
};
