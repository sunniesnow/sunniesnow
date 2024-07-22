Sunniesnow.Game = class Game {
	static run() {
		if (Sunniesnow.Loader.loadingChart) {
			Sunniesnow.Logs.warn('Waiting for level file to load')
			Sunniesnow.Loader.addChartLoadListener(() => this.run());
			return;
		}
		if (Sunniesnow.game) {
			if (!Sunniesnow.Loader.loadingComplete) {
				Sunniesnow.Logs.warn('Still loading');
				return;
			}
			Sunniesnow.game.terminate();
		}
		Sunniesnow.Logs.clearWarningsAndErrors();
		Sunniesnow.game = new this();
		Sunniesnow.Loader.load();
	}

	mainTicker(delta) {
		if (Sunniesnow.Loader.loadingComplete) {
			if (!this.sceneInitialized) {
				document.activeElement.blur();
				this.initLevel();
				this.initScene();
			}
			this.update(delta);
		} else {
			Sunniesnow.Loader.updateLoading();
		}
	}

	initLevel() {
		this.level = new Sunniesnow.Level();
	}

	goto(scene) {
		this.scene = scene;
	}

	initScene() {
		if (Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.Settings.clearDownloadingProgresses();
		}
		if (this.settings.touchEffects) {
			this.app.stage.addChild(Sunniesnow.TouchManager.touchEffectsBoard);
		}
		this.hidePauseUi = this.settings.hidePauseUi;
		this.goto(new Sunniesnow.SceneGame());
		this.sceneInitialized = true;
	}

	updateModules(delta) {
		Sunniesnow.Music.update();
		Sunniesnow.TouchManager.update(delta);
	}

	update(delta) {
		if (this.scene !== this.lastScene) {
			if (this.lastScene) {
				this.lastScene.terminate();
				this.app.stage.removeChild(this.lastScene);
			}
			if (this.scene) {
				this.app.stage.addChildAt(this.scene, 0);
				this.scene.start();
			}
			this.lastScene = this.scene;
		}
		this.updateModules(delta);
		if (this.scene) {
			this.scene.update(delta);
		} else {
			this.terminate();
		}
	}

	terminate() {
		this.terminating = true;
		if (this.scene) {
			this.scene.terminate();
		}
		Sunniesnow.Fullscreen.set(false);
		Sunniesnow.Audio.stopAll();
		Sunniesnow.TouchManager.terminate();
		Sunniesnow.SpinUp.terminate();
		Sunniesnow.Popup.close();
		if (!this.app) {
			return;
		}
		try {
			this.app.stop();
			this.app.destroy();
		} catch (error) {
			console.error(error);
		}
	}

	pause() {
		Sunniesnow.Music.pause();
		this.hidePauseUi = this.settings.hidePauseUi;
	}

	resume() {
		Sunniesnow.Music.resume();
	}

	togglePausing() {
		Sunniesnow.Music.togglePausing();
		this.hidePauseUi = this.settings.hidePauseUi;
	}

	retry() {
		if (this.scene instanceof Sunniesnow.SceneGame) {
			this.scene.retry();
		} else if (this.scene instanceof Sunniesnow.SceneResult) {
			this.scene.gotoGame();
		}
	}
};
