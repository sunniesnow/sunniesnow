Sunniesnow.UiNote = class UiNote extends Sunniesnow.UiNoteBase {

	constructor(event, fxBoard, debugBoard) {
		super(event);
		this.levelNote = event.levelNote;
		this.fxBoard = fxBoard;
		this.debugBoard = debugBoard;
		this.addEventListeners();
	}

	update(relativeTime) {
		super.update(relativeTime);
		if (Sunniesnow.game.settings.debug) {
			const judgementWindows = Sunniesnow.Config.appropriateJudgementWindows();
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

	addEventListeners() {
		this.removeEventListeners();
		this.listenerForFx = event => this.fxBoard.addFx(this);
		this.levelNote.addEventListener('release', this.listenerForFx);
		if (this.levelNote instanceof Sunniesnow.LevelHold && !Sunniesnow.game.settings.hideFxHoldStart) {
			this.levelNote.addEventListener('hit', this.listenerForFx);
		}
		this.levelNote.addEventListener('miss', this.listenerForFx);
		if (!Sunniesnow.game.settings.autoplay && Sunniesnow.game.settings.debug) {
			this.listenerForDebug = event => this.debugBoard.createEarlyLateText(this);
			const type = this.levelNote instanceof Sunniesnow.LevelDrag ? 'release' : 'hit'
			this.levelNote.addEventListener(type, this.listenerForDebug);
		}
	}

	removeEventListeners() {
		if (this.listenerForFx) {
			this.levelNote.removeEventListener('release', this.listenerForFx);
			if (this.levelNote instanceof Sunniesnow.LevelHold && !Sunniesnow.game.settings.hideFxHoldStart) {
				this.levelNote.removeEventListener('hit', this.listenerForFx);
			}
			this.levelNote.removeEventListener('miss', this.listenerForFx);
		}
		if (this.listenerForDebug) {
			const type = this.levelNote instanceof Sunniesnow.LevelDrag ? 'release' : 'hit'
			this.levelNote.removeEventListener(type, this.listenerForDebug);
		}
	}

	destroy(options) {
		this.removeEventListeners();
		super.destroy(options);
	}

};
