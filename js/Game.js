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
		Sunniesnow.Settings.clearDownloadingProgresses();
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
			const modifier = (navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey) || event.altKey;
			const pausing = Sunniesnow.Music.pausing || this.level.finished;
			let condition = this.settings.contextMenuPause && pausing;
			condition ||= this.settings.contextMenuPlay && !pausing;
			condition &&= !(this.settings.contextMenuNoModifier && modifier);
			if (condition) {
				Sunniesnow.TouchManager.clear();
			} else {
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
				this.pause();
			}
		};
		if (this.settings.pauseFullscreen) {
			document.addEventListener('fullscreenchange', this.blurListener, true);
		}
		if (this.settings.pauseBlur) {
			window.addEventListener('blur', this.blurListener);
			document.addEventListener('visibilitychange', this.blurListener);
			document.addEventListener('pagehide', this.blurListener);
		}
	}

	removeWindowListeners() {
		if (!this.blurListener) {
			return;
		}
		if (this.settings.pauseFullscreen) {
			document.removeEventListener('fullscreenchange', this.blurListener);
		}
		if (this.settings.pauseBlur) {
			window.removeEventListener('blur', this.blurListener);
			document.removeEventListener('visibilitychange', this.blurListener);
			document.removeEventListener('pagehide', this.blurListener);
		}
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
