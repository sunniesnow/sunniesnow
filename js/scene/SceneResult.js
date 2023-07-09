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
	}

	addListeners() {
		// TODO
	}

	populateLegacyUis() {
		for (const ui of this.legacyUis) {
			this.addChild(ui);
		}
	}

	populateUiAndButtons() {
		this.addChild(this.pauseButton = new Sunniesnow.ButtonPause(() => this.switchPausing()));
		this.addChild(this.result = new Sunniesnow.Result());
	}

	switchPausing() {
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
		// TODO
	}
};
