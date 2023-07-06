Sunniesnow.UiBgNote = class UiBgNote extends Sunniesnow.UiNoteBase {
	static FADING_OUT_DURATION = 0.25;

	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius();
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
		this.text = this.createText();
		this.note.addChild(this.text)
		this.addChild(this.note);
	}

	updateFadingIn(progress) {
		super.updateFadingIn(progress);
		this.note.alpha = progress;
		this.note.scale.set(progress);
	}

	updateActive(progress) {
		super.updateActive(progress);
		this.note.alpha = 1;
		this.note.scale.set(1);
	}

	updateFadingOut(progress) {
		super.updateFadingOut(progress);
		this.note.scale.set(1 + (1 - (1 - progress) ** 2) * 0.5);
		this.note.alpha = 1 - progress;
	}

};
