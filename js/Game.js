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
	}

	mainTicker(delta) {
		if (Sunniesnow.Loader.loadingComplete) {
			if (!this.sceneInitialized) {
				this.initLevel();
				this.initScene();
			}
			this.update(delta);
		} else {
			Sunniesnow.Loader.updateLoading();
		}
	}

	initCanvas() {
		this.canvas = document.getElementById('main-canvas');
		this.addCanvasListeners();
	}

	addCanvasListeners() {
		this.canvasContextMenuListener = event => {
			if (!Sunniesnow.Music.pausing && !this.level.finished) {
				event.preventDefault();
			}
		};
		this.canvasFullscreenChangeListener = event => {
			this.shouldFullscreen = !!document.fullscreenElement;
		};
		this.canvas.addEventListener('contextmenu', this.canvasContextMenuListener);
		this.canvas.addEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	}

	removeCanvasListeners() {
		if (!this.canvasContextMenuListener) {
			return;
		}
		this.canvas.removeEventListener('contextmenu', this.canvasContextMenuListener);
		this.canvas.removeEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	}

	addWindowListeners() {
		this.blurListener = event => {
			Sunniesnow.TouchManager.clear();
			if (!this.level.finished) {
				Sunniesnow.Music.pause();
			}
		};
		window.addEventListener('blur', this.blurListener);
	}

	removeWindowListeners() {
		if (!this.blurListener) {
			return;
		}
		window.removeEventListener('blur', this.blurListener);
	}

	initPixiApp() {
		this.app = new PIXI.Application({
			hello: this.settings.debug,
			width: this.settings.width,
			height: this.settings.height,
			view: this.canvas,
			backgroundColor: 'black',
			eventFeatures: {
				click: false,
				globalMove: false,
				move: false,
				wheel: false
			},
			forceCanvas: this.settings.renderer === 'canvas',
			antialias: this.settings.antialias,
			powerPreference: this.settings.powerPreference,
		});
		if (this.settings.fullscreen) {
			this.setFullscreen(true);
		}
	}

	initLevel() {
		this.level = new Sunniesnow.Level();
	}

	goto(scene) {
		this.scene = scene;
	}

	initScene() {
		this.goto(new Sunniesnow.SceneGame());
		this.sceneInitialized = true;
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
		this.removeCanvasListeners();
		this.removeWindowListeners();
		if (this.app) {
			this.app.stop();
		}
	}
};
