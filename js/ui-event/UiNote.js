Sunniesnow.UiNote = class UiNote extends Sunniesnow.UiEvent {

	static FADING_IN_DURATION = 0.25;
	static FADING_OUT_DURATION = 0;

	constructor(event, fxBoard) {
		super(event);
		this.levelNote = event.levelNote;
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		[this.x, this.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
		this.fxBoard = fxBoard;
	}

	updateState(relativeTime) {
		this.lastState = this.state;
		super.updateState(relativeTime);
		if (this.lastState !== this.state && (this.lastState === 'active' || this.lastState === 'holding')) {
			this.fxBoard.addFx(this);
		}
	}
};
