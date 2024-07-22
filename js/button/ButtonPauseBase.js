Sunniesnow.ButtonPauseBase = class ButtonPauseBase extends Sunniesnow.Button {
	
	constructor(pauseBoard, priority = 150) {
		super(() => this.theOnTrigger(), priority);
		this.pauseBoard = pauseBoard;
	}
	
	onTouchStart(touch) {
		switch (touch.type) {
			case 'mouse':
				if (Sunniesnow.game.settings.pauseButtons.some(s => Number(s) === touch.button)) {
					this.onTrigger();
					return true;
				}
				if (!Sunniesnow.game.level.finished && !Sunniesnow.game.settings.mousePause) {
					return false;
				}
				break;
			case 'key':
				if (Sunniesnow.game.settings.pauseKeys.includes(touch.key)) {
					this.onTrigger();
					return true;
				}
				if (!Sunniesnow.game.level.finished && !Sunniesnow.game.settings.keyboardPause) {
					return false;
				}
				break;
			case 'touch':
				if (!Sunniesnow.game.level.finished && !Sunniesnow.game.settings.touchPause) {
					return false;
				}
				break;
		}
		return super.onTouchStart(touch);
	}

	theOnTrigger() {
		if (Sunniesnow.game.level.finished) {
			Sunniesnow.game.togglePausing();
			return;
		}
		if (!Sunniesnow.Music.pausing) {
			if (!Sunniesnow.game.settings.pauseDoubleTime) {
				Sunniesnow.game.togglePausing();
			} else if (this.doubleTapElapsed <= Sunniesnow.game.settings.pauseDoubleTime) {
				this.doubleTapElapsed = null;
				Sunniesnow.game.togglePausing();
			} else {
				this.doubleTapElapsed = 0;
			}
			return;
		}
		switch (Sunniesnow.game.settings.secondPause) {
			case 'resume':
				Sunniesnow.game.resume();
				break;
			case 'disabled':
				break;
			case 'toggle-ui':
				Sunniesnow.game.hidePauseUi = !Sunniesnow.game.hidePauseUi;
				break;
		}
	}

	update(delta) {
		if (this.doubleTapElapsed >= 0) {
			this.doubleTapElapsed += delta / PIXI.settings.TARGET_FPMS / 1000;
		}
	}

};
