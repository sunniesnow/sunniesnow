Sunniesnow.PauseBoard = class PauseBoard extends PIXI.Container {
	constructor(sceneGame) {
		super();
		this.sceneGame = sceneGame;
		this.populate();
		this.visible = false;
	}

	populate() {
		this.addChild(this.background = new Sunniesnow.PauseBackground());
		this.addChild(this.resume = new Sunniesnow.ButtonResume(() => Sunniesnow.Music.resume()));
		this.addChild(this.retry = new Sunniesnow.ButtonRetry(() => this.sceneGame.retry()));
		this.addChild(this.fullscreen = new Sunniesnow.ButtonFullscreen(() => Sunniesnow.game.toggleFullscreen()));
	}

	triggerIfContainsPage(x, y) {
		if (this.resume.triggerIfContainsPage(x, y)) {
			return true;
		}
		if (this.retry.triggerIfContainsPage(x, y)) {
			return true;
		}
		if (this.fullscreen.triggerIfContainsPage(x, y)) {
			return true;
		}
		return false;
	}

};
