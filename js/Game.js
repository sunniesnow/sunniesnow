Sunniesnow.Game = class Game {
	static run() {
		if (Sunniesnow.Loader.loadingChart) {
			Sunniesnow.Utils.warn('Waiting for level file to load')
			Sunniesnow.Loader.addChartLoadListener(() => this.run());
			return;
		}
		if (Sunniesnow.game) {
			if (!Sunniesnow.Loader.loadingComplete) {
				Sunniesnow.Utils.warn('Still loading');
				return;
			}
			Sunniesnow.game.terminate();
		}
		Sunniesnow.Utils.clearWarningsAndErrors();
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
			if (Sunniesnow.Fullscreen.entering || Sunniesnow.Fullscreen.quitting) {
				return;
			}
			if (!this.level?.finished && this.sceneInitialized) {
				Sunniesnow.Music.pause();
			}
		};
		window.addEventListener('blur', this.blurListener);
		document.addEventListener('fullscreenchange', this.blurListener, true);
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
		/*if (this.settings.renderer === 'canvas') {
			this.maxTextureSize = Infinity
		} else {
			const gl = this.app.renderer.gl;
			this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		}*/
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
		if (this.settings.touchEffects) {
			this.app.stage.addChild(Sunniesnow.TouchManager.touchEffectsBoard);
		}
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
		if (this.scene) {
			this.scene.terminate();
		}
		Sunniesnow.Fullscreen.set(false);
		Sunniesnow.Audio.stopAll();
		Sunniesnow.TouchManager.terminate();
		this.removeCanvasListeners();
		this.removeWindowListeners();
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
};
