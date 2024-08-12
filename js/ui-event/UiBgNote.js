Sunniesnow.UiBgNote = class UiBgNote extends Sunniesnow.UiNoteBase {
	static FADING_OUT_DURATION = 1/4;

	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x000000, 0.7);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.radius, 6, Math.PI/2);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.note = new PIXI.Graphics(this.constructor.geometry);
		this.text = Sunniesnow.UiTap.prototype.createText.call(this);
		this.note.addChild(this.text)
		this.addChild(this.note);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.alpha = progress;
		this.note.scale.set(progress);
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.alpha = 1;
		this.note.scale.set(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		const fadingProgress = (1 - Sunniesnow.game.settings.fadingStart) / Sunniesnow.game.settings.fadingDuration;
		this.fadingAlpha = Sunniesnow.Utils.clamp(1 - fadingProgress, 0, 1);
		this.note.scale.set(1 + (1 - (1 - progress) ** 2) * 0.5);
		this.note.alpha = 1 - progress;
	}

};
