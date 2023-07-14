Sunniesnow.ButtonPauseBase = class ButtonPauseBase extends Sunniesnow.Button {
	
	constructor(priority = 150) {
		super(() => Sunniesnow.Music.togglePausing(), priority);
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

};
