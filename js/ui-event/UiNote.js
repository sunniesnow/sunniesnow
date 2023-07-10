Sunniesnow.UiNote = class UiNote extends Sunniesnow.UiNoteBase {

	static FADING_IN_DURATION = 0.25;
	static FADING_OUT_DURATION = 0;

	constructor(event, fxBoard, debugBoard) {
		super(event);
		this.levelNote = event.levelNote;
		this.fxBoard = fxBoard;
		this.debugBoard = debugBoard;
	}

	updateState(relativeTime) {
		this.lastState = this.state;
		super.updateState(relativeTime);
		if (this.lastState !== this.state && (this.lastState === 'active' || this.lastState === 'holding')) {
			this.fxBoard.addFx(this);
			if (this.lastState === 'active' && !Sunniesnow.game.settings.autoplay && Sunniesnow.game.settings.debug) {
				this.debugBoard.createEarlyLateText(this);
			}
		}
		if (Sunniesnow.game.settings.debug) {
			const judgementWindows = Sunniesnow.Config.judgementWindows[Sunniesnow.game.settings.judgementWindows];
			const earlyBad = judgementWindows[this.levelNote.type].bad[0];
			if (!this.touchAreaCreated && relativeTime >= earlyBad) {
				this.debugBoard.createTouchArea(this);
				this.touchAreaCreated = true;
			}
		}
	}

	newFx() {
		return new Sunniesnow[this.event.constructor.FX_CLASS](this);
	}

};
