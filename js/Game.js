Sunniesnow.Game = class Game {
	static run() {
		if (Sunniesnow.Loader.loadingChart) {
			Sunniesnow.Loader.addChartLoadListener(() => this.run());
			return;
		}
		Sunniesnow.Utils.clearWarningsAndErrors();
		if (Sunniesnow.game) {
			if (!Sunniesnow.Loader.loadingComplete) {
				return;
			}
			Sunniesnow.game.terminate();
		}
		Sunniesnow.game = new this();
		Sunniesnow.game.start();
		Sunniesnow.game.app.ticker.add(Sunniesnow.game.mainTicker.bind(Sunniesnow.game));
	}

	start() {
		Sunniesnow.Loader.load();
		this.initCanvas();
		this.initPixiApp();
		this.addWindowListeners();
		this.scene = new Sunniesnow.SceneGame();
	}

	mainTicker(delta) {
		if (Sunniesnow.Loader.loadingComplete) {
			this.update(delta);
		} else {
			Sunniesnow.Loader.updateLoading();
		}
	}

	initCanvas() {
		this.canvas = document.getElementById('main-canvas');
		this.canvas.addEventListener('contextmenu', event => {
			if (!Sunniesnow.Music.pausing && !Sunniesnow.game.level.finished) {
				event.preventDefault();
			}
		});
		this.canvas.addEventListener('fullscreenchange', event => {
			this.shouldFullscreen = !!document.fullscreenElement;
		});
	}

	addWindowListeners() {
		this.blurListener = event => {
			Sunniesnow.TouchManager.clear();
			if (!Sunniesnow.game.level.finished) {
				Sunniesnow.Music.pause();
			}
		};
		window.addEventListener('blur', this.blurListener);
	}

	removeWindowListeners() {
		window.removeEventListener('blur', this.blurListener);
	}


	initPixiApp() {
		this.app = new PIXI.Application({
			width: this.settings.width,
			height: this.settings.height,
			view: this.canvas,
			backgroundColor: 'black',
			antialias: true
		});
		if (this.settings.fullscreen) {
			this.setFullscreen(true);
		}
	}

	initLevel() {
		this.chart = new Sunniesnow.Chart(Sunniesnow.Loader.loaded.chart.charts[this.settings.chartSelect]);
		Sunniesnow.game.level = new Sunniesnow.Level();
	}

	setFullscreen(fullscreen) {
		this.shouldFullscreen = fullscreen;
		this.needsHandleFullscreen = true;
	}

	toggleFullscreen() {
		this.setFullscreen(!this.shouldFullscreen);
	}

	updateModules() {
		Sunniesnow.Music.update();
		Sunniesnow.TouchManager.update();
	}

	update(delta) {
		if (this.scene !== this.lastScene) {
			if (this.lastScene) {
				this.lastScene.terminate();
				this.app.stage.removeChild(this.lastScene);
			}
			if (this.scene) {
				this.app.stage.addChild(this.scene);
				this.scene.start();
			}
			this.lastScene = this.scene;
		}
		this.updateModules();
		if (this.scene) {
			this.scene.update(delta);
		} else {
			this.terminate();
		}
		if (this.needsHandleFullscreen) {
			if (this.shouldFullscreen && !document.fullscreenElement) {
				this.app.view.requestFullscreen().then(
					null,
					reason => Sunniesnow.Utils.warn('Failed to request fullscreen: ' + reason)
				);
			} else if (!this.shouldFullscreen && document.fullscreenElement) {
				document.exitFullscreen();
			}
			this.needsHandleFullscreen = false;
		}
	}

	terminate() {
		if (this.scene) {
			this.scene.terminate();
		}
		this.setFullscreen(false);
		Sunniesnow.Audio.stopAll();
		Sunniesnow.TouchManager.terminate();
		this.removeWindowListeners();
		if (this.app) {
			this.app.stop();
		}
	}
};
