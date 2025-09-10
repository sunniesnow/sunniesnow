Sunniesnow.UiTap = class UiTap extends Sunniesnow.UiNote {

	static async load() {
		this.loadFontIfNeeded();
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
		this.circleRadius = this.radius * 4;
		this.circleGeometry = this.createCircleGeometry(0xccfcfc);
		this.doubleCircleGeometry = this.createCircleGeometry(0xf9f9e9);
		this.geometry = this.createNoteBodyGeometry(0x29a9b9, 0xe8f8b8);
		this.doubleGeometry = this.createNoteBodyGeometry(0x3171d1, 0xe3f3f3);
		this.textStyle = this.createTextStyle();
	}

	populate() {
		super.populate();
		this.noteBody = new PIXI.Graphics(this.hasConnectedTap() ? this.constructor.doubleGeometry : this.constructor.geometry);
		this.text = this.createText();
		this.note = new PIXI.Container();
		this.note.addChild(this.noteBody)
		this.note.addChild(this.text);
		this.addChild(this.note);
	}

	populateCircle() {
		super.populateCircle();
		this.circleGraphics = new PIXI.Graphics(this.hasConnectedTap() ? this.constructor.doubleCircleGeometry : this.constructor.circleGeometry);
		this.circle.addChild(this.circleGraphics);
	}

	hasConnectedTap() {
		return this.event.simultaneousEvents.some(event => {
			return event !== this.event && event instanceof Sunniesnow.Tap
		});
	}

	update(relativeTime) {
		this.updateText(relativeTime);
		super.update(relativeTime);
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

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.updateTextFadingOut(progress);
		this.noteBody.visible = false;
		if (!this.circle) {
			return;
		}
		this.circleGraphics.visible = false;
	}

	static fadingOutDuration(event) {
		return event.text ? super.fadingOutDuration() : 0;
	}

};
