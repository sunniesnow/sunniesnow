Sunniesnow.PauseBoard = class PauseBoard extends PIXI.Container {
	constructor() {
		super();
		this.populate();
		this.visible = false;
	}

	populate() {
		this.label = 'pause-board';
		this.addChild(this.background = new Sunniesnow.PauseBackground());
		this.addChild(this.resume = new Sunniesnow.ButtonResume(() => Sunniesnow.game.resume()));
		this.addChild(this.retry = new Sunniesnow.ButtonRetry(() => Sunniesnow.game.retry()));
		this.addChild(this.fullscreen = new Sunniesnow.ButtonFullscreen(
			() => Sunniesnow.FullscreenManager.toggle(),
			// on Android WebView, exiting fullscreen with `touch-action: none;` in touchstart listener
			// makes the webpage unscrollable.
			// https://github.com/pixijs/pixijs/issues/11564
			{useTouchEnd: true}
		));
	}

	triggerIfContains(x, y) {
		if (this.resume.triggerIfContains(x, y)) {
			return true;
		}
		if (this.retry.triggerIfContains(x, y)) {
			return true;
		}
		if (this.fullscreen.triggerIfContains(x, y)) {
			return true;
		}
		return false;
	}

	update(delta) {
		this.visible = Sunniesnow.Music.pausing && !Sunniesnow.game.hidePauseUi;
	}

};
