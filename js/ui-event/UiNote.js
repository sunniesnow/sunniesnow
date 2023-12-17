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
		this.levelNote.addEventListener('release', event => this.fxBoard.addFx(this));
		if (this.levelNote instanceof Sunniesnow.LevelHold) {
			this.levelNote.addEventListener('hit', event => this.fxBoard.addFx(this));
		}
		this.levelNote.addEventListener('miss', event => this.fxBoard.addFx(this));
		if (!Sunniesnow.game.settings.autoplay && Sunniesnow.game.settings.debug) {
			const type = this.levelNote instanceof Sunniesnow.LevelDrag ? 'release' : 'hit'
			this.levelNote.addEventListener(type, event => this.debugBoard.createEarlyLateText(this));
		}
	}

};
