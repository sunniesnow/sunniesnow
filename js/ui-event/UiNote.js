Sunniesnow.UiNote = class UiNote extends Sunniesnow.UiNoteBase {

	constructor(event) {
		super(event);
		this.levelNote = event.levelNote;
	}

	update(relativeTime) {
		super.update(relativeTime);
		if (Sunniesnow.game.settings.debug) {
			const judgementWindows = Sunniesnow.Config.JUDGEMENT_WINDOWS;
			const earlyBad = judgementWindows[this.levelNote.type].bad[0];
			if (!this.touchAreaCreated && relativeTime >= earlyBad) {
				Sunniesnow.game.debugBoard.createTouchArea(this);
				this.touchAreaCreated = true;
			}
		}
	}

};
