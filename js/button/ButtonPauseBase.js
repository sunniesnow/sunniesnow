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
		if (!Sunniesnow.Music.pausing || Sunniesnow.game.level.finished) {
			Sunniesnow.Music.togglePausing();
			this.pauseBoard.hiddenByPauseButton = Sunniesnow.game.settings.hidePauseUi;
			return;
		}
		switch (Sunniesnow.game.settings.secondPause) {
			case 'resume':
				Sunniesnow.Music.resume();
				break;
			case 'disabled':
				break;
			case 'toggle-ui':
				this.pauseBoard.hiddenByPauseButton = !this.pauseBoard.hiddenByPauseButton;
				break;
		}
	}

};
