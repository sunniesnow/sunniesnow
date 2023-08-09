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
		Sunniesnow.Loader.load();
		Sunniesnow.game.start();
		Sunniesnow.game.app.ticker.add(Sunniesnow.game.mainTicker.bind(Sunniesnow.game));
	}

	start() {
		this.initPixiApp();
		this.initCanvas();
		if (Sunniesnow.Utils.isBrowser()) {
			this.addWindowListeners();
		}
	}

	clearDom() {
		Sunniesnow.Dom.clearDownloadingProgresses();
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
		this.canvas = this.app.view;
		this.canvas.id = 'main-canvas';
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		this.addCanvasListeners();
		if (this.settings.fullscreenOnStart) {
			Sunniesnow.Fullscreen.set(true);
		}
	}

	addCanvasListeners() {
		this.canvasContextMenuListener = event => {
			if (!Sunniesnow.Music.pausing && !this.level.finished) {
				event.preventDefault();
			}
		};
		this.canvas.addEventListener('contextmenu', this.canvasContextMenuListener);
		Sunniesnow.Fullscreen.addListenerToCanvas();
	}

	removeCanvasListeners() {
		if (!this.canvasContextMenuListener) {
			return;
		}
		this.canvas.removeEventListener('contextmenu', this.canvasContextMenuListener);
		Sunniesnow.Fullscreen.removeListenerFromCanvas();
	}

	addWindowListeners() {
		this.blurListener = event => {
			Sunniesnow.TouchManager.clear();
			if (!this.level?.finished && this.sceneInitialized) {
				Sunniesnow.Music.pause();
			}
		};
		window.addEventListener('blur', this.blurListener);
		document.addEventListener('fullscreenchange', this.blurListener);
		document.addEventListener('visibilitychange', this.blurListener);
	}

	removeWindowListeners() {
		if (!this.blurListener) {
			return;
		}
		window.removeEventListener('blur', this.blurListener);
		document.removeEventListener('fullscreenchange', this.blurListener);
		document.removeEventListener('visibilitychange', this.blurListener);
	}

	initPixiApp() {
		this.app = new PIXI.Application({
			hello: this.settings.debug,
			width: this.settings.width,
			height: this.settings.height,
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
			autoStart: Sunniesnow.Utils.isBrowser()
		});
		if (Sunniesnow.Utils.isBrowser()) {
			document.getElementById('main-canvas').replaceWith(this.app.view);
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
			this.clearDom();
		}
		this.goto(new Sunniesnow.SceneGame());
		this.sceneInitialized = true;
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
	}

	terminate() {
		if (this.scene) {
			this.scene.terminate();
		}
		Sunniesnow.Fullscreen.set(false);
		Sunniesnow.Audio.stopAll();
		Sunniesnow.TouchManager.terminate();
		this.removeCanvasListeners();
		this.removeWindowListeners();
		if (this.app) {
			this.app.stop();
		}
	}
};
