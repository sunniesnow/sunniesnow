Sunniesnow.UiNoteBase = class UiNote extends Sunniesnow.UiEvent {

	static FADING_IN_DURATION = 1/4;
	static FADING_OUT_DURATION = 2/3;

	constructor(event) {
		super(event);
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		[this.x, this.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
	}

};
