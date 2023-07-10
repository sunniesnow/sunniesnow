Sunniesnow.Game = class Game {
	static run() {
		Sunniesnow.Utils.clearWarningsAndErrors();
		if (Sunniesnow.game) {
			Sunniesnow.game.terminate();
		}
		Sunniesnow.game = new this();
		Sunniesnow.game.start();
		Sunniesnow.game.app.ticker.add(Sunniesnow.game.mainTicker.bind(Sunniesnow.game));
	}

	start() {
		Sunniesnow.Loader.readSettings(this);
		this.initCanvas();
		this.initLevel();
		Sunniesnow.Loader.load();
		this.initPixiApp();
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
			if (!this.canvas.canHaveContextMenu) {
				event.preventDefault();
			}
		});
		this.canvas.addEventListener('fullscreenchange', event => {
			this.shouldFullscreen = !!document.fullscreenElement;
		})
		this.canvas.canHaveContextMenu = true;
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
		if (this.scene) {
			this.scene.update(delta);
		} else {
			this.terminate();
		}
		if (this.needsHandleFullscreen) {
			if (this.shouldFullscreen && !document.fullscreenElement) {
				this.app.view.requestFullscreen();
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
		if (this.app) {
			this.app.stop();
		}
	}
};
