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
		this.addChild(this.fullscreen = new Sunniesnow.ButtonFullscreen(() => Sunniesnow.Fullscreen.toggle()));
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
