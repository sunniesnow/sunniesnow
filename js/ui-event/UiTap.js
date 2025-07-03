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
		this.noteBody = new PIXI.Graphics(this.hasConnectedTap() ? Sunniesnow.UiTap.doubleGeometry : Sunniesnow.UiTap.geometry);
		this.text = this.createText();
		this.note = new PIXI.Container();
		this.note.addChild(this.noteBody)
		this.note.addChild(this.text);
		this.addChild(this.note);
	}

	populateCircle() {
		this.circle = new PIXI.Graphics(this.hasConnectedTap() ? Sunniesnow.UiTap.doubleCircleGeometry : Sunniesnow.UiTap.circleGeometry);
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

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.updateTextFadingOut(progress);
		this.noteBody.visible = false;
		if (!this.circle) {
			return;
		}
		this.circle.visible = false;
	}

	static fadingOutDuration(event) {
		return event.text ? super.fadingOutDuration() : 0;
	}

};
