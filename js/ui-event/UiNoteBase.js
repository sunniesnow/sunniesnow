Sunniesnow.UiNoteBase = class UiNote extends Sunniesnow.UiEvent {

	static FADING_IN_DURATION = 0.25;
	static FADING_OUT_DURATION = 0;

	constructor(event) {
		super(event);
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		[this.x, this.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
	}

	createText(maxWidth, maxSize, font) {
		maxWidth ||= this.constructor.radius * 1.5;
		maxSize ||= this.constructor.radius;
		const text = new PIXI.Text(this.event.text, {
			fontSize: maxSize,
			fill: 'white',
			align: 'center',
			fontFamily: font || 'Arial'
		});
		text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		text.scale.set(Math.min(maxWidth / text.width, 1));
		return text;
	}

};
