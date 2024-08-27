Sunniesnow.UiNote = class UiNote extends Sunniesnow.UiNoteBase {

	constructor(event) {
		super(event);
		this.levelNote = event.levelNote;
		if (!Sunniesnow.game.settings.hideCircles) {
			this.populateCircle();
			this.circle.visible = false;
			this.circle.x = this.x;
			this.circle.y = Sunniesnow.game.settings.scroll ? Sunniesnow.Config.SCROLL_END_Y : this.y;
		}
	}

	populateCircle() {
		this.circle = new PIXI.Container();
	}

	updateState(relativeTime) {
		super.updateState(relativeTime);
		if (this.circle) {
			this.circle.visible = this.visible;
		}
	}

	update(relativeTime) {
		super.update(relativeTime);
		if (Sunniesnow.game.settings.circleMovesWithNote) {
			this.circle?.position.set(this.x, this.y);
		}
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
