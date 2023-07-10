Sunniesnow.SceneResult = class SceneResult extends Sunniesnow.Scene {
	// Some UIs are still useful after SceneGame terminates
	constructor(legacyUis) {
		super();
		this.legacyUis = legacyUis;
	}

	start() {
		super.start();
		this.addListeners();
		this.populateLegacyUis();
		this.populateUiAndButtons();
		Sunniesnow.game.canvas.canHaveContextMenu = true;
	}

	addListeners() {
		this.touchStartListener = event => {
			event.preventDefault();
			if (this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				return;
			}
			this.retryButton.triggerIfContainsPage(event.pageX, event.pageY);
		}
		Sunniesnow.game.canvas.addEventListener('touchstart', this.touchStartListener);
		this.mouseDownListener = event => {
			event.preventDefault();
			if (this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				return;
			}
			this.retryButton.triggerIfContainsPage(event.pageX, event.pageY);
		}
		Sunniesnow.game.canvas.addEventListener('mousedown', this.mouseDownListener);
		this.keyDownListener = event => {
			if (event.key === '`') {
				this.togglePausing();
			}
		}
		window.addEventListener('keydown', this.keyDownListener);
	}

	populateLegacyUis() {
		for (const ui of this.legacyUis) {
			this.addChild(ui);
		}
	}

	populateUiAndButtons() {
		this.addChild(this.pauseButton = new Sunniesnow.ButtonPause(() => this.togglePausing()));
		this.addChild(this.result = new Sunniesnow.Result());
		this.addChild(this.retryButton = new Sunniesnow.ButtonResultRetry(() => this.gotoGame()));
	}

	togglePausing() {
		if (Sunniesnow.Music.pausing) {
			Sunniesnow.Music.resume();
		} else {
			Sunniesnow.Music.pause();
		}
	}

	update(delta) {
		super.update(delta);
		Sunniesnow.Music.update();
		this.updateLegacyUis(delta);
		this.updateUisAndButtons(delta);
	}

	updateLegacyUis(delta) {
		for (const ui of this.legacyUis) {
			if (ui.update) {
				ui.update(delta);
			}
		}
	}

	updateUisAndButtons(delta) {
		this.result.update(delta);
		if (Sunniesnow.Music.finished) {
			this.pauseButton.visible = false;
		}
	}

	terminate() {
		super.terminate();
		this.removeListeners();
	}

	removeListeners() {
		Sunniesnow.game.canvas.removeEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.removeEventListener('mousedown', this.mouseDownListener);
		window.removeEventListener('keydown', this.keyDownListener);
	}

	gotoGame() {
		Sunniesnow.game.level = new Sunniesnow.Level();
		Sunniesnow.game.scene = new Sunniesnow.SceneGame();
	}
};
