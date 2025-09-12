Sunniesnow.SceneResult = class SceneResult extends Sunniesnow.Scene {
	// Some UIs are still useful after SceneGame terminates
	constructor(legacyUis) {
		super();
		this.label = 'scene-result';
		this.legacyUis = legacyUis;
	}

	start() {
		super.start();
		this.populateLegacyUis();
		this.populateUiAndButtons();
	}

	populateLegacyUis() {
		for (const ui of this.legacyUis) {
			ui?.addTo?.(this);
		}
	}

	populateUiAndButtons() {
		this.addChild(this.pauseButton = new Sunniesnow.ButtonPause());
		this.addChild(this.result = new Sunniesnow.Result());
		this.addChild(this.retryButton = new Sunniesnow.ButtonResultRetry(() => this.gotoGame()));
		this.addChild(this.fullscreenButton = new Sunniesnow.ButtonResultFullscreen(() => Sunniesnow.Fullscreen.toggle()));
		this.addChild(this.additionalInfo = new Sunniesnow.ResultAdditionalInfo());
	}

	update(delta) {
		super.update(delta);
		this.updateLegacyUis(delta);
		this.updateUisAndButtons(delta);
	}

	updateLegacyUis(delta) {
		for (const ui of this.legacyUis) {
			ui?.update?.(delta);
		}
	}

	updateUisAndButtons(delta) {
		if (Sunniesnow.Music.currentTime >= Sunniesnow.Music.duration && this.pauseButton) {
			this.pauseButton.destroy({children: true});
			this.pauseButton = null;
		}
	}

	terminate() {
		super.terminate();
		this.pauseButton?.destroy({children: true});
		this.retryButton.destroy({children: true});
		this.fullscreenButton.destroy({children: true});
		this.result.destroy({children: true});
		this.additionalInfo.destroy({children: true});
	}

	gotoGame() {
		Sunniesnow.game.initLevel();
		Sunniesnow.game.goto(new Sunniesnow.SceneGame());
	}
};
