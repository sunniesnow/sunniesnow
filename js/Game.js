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
		Sunniesnow.Logs.clear();
		Sunniesnow.game = new this();
		Sunniesnow.Loader.load();
	}

	mainTicker({deltaTime}) {
		if (!this.sceneInitialized) {
			this.initScene();
		}
		this.update(deltaTime);
	}

	async initPixiApp() {
		this.app = new PIXI.Application();
		const appOptions = {
			hello: this.settings.debug,
			width: this.settings.width,
			height: this.settings.height,
			backgroundColor: 'black',
			eventMode: 'none', // use our own event system
			eventFeatures: {click: false, globalMove: false, move: false, wheel: false},
			preference: this.settings.renderer,
			autoStart: Sunniesnow.Utils.isBrowser()
		};
		if (this.settings.renderer === 'webgl') {
			appOptions.preferWebGLVersion = this.settings.glVersion;
			appOptions.antialias = this.settings.glAntialias;
			appOptions.powerPreference = this.settings.glPowerPreference;
		} else if (this.settings.renderer === 'webgpu') {
			appOptions.antialias = this.settings.gpuAntialias;
			appOptions.powerPreference = this.settings.gpuPowerPreference;
		}
		await this.app.init(appOptions);
		/*if (this.settings.renderer === 'canvas') {
			this.maxTextureSize = Infinity
		} else {
			const gl = this.app.renderer.gl;
			this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		}*/
		this.app.ticker.add(this.mainTicker.bind(this));
		this.app.stage.label = 'stage';
		if (Sunniesnow.environment === 'development') {
			// PIXI.initDevtools({app: this.app});
			globalThis.__PIXI_APP__ = this.app;
		}
	}

	initLevel() {
		this.debugBoard?.removeLevelListeners();
		this.level = new Sunniesnow.Level();
		this.debugBoard?.addLevelListeners();
	}

	goto(scene) {
		this.scene = scene;
	}

	initScene() {
		this.goto(new Sunniesnow.SceneLoading());
		this.sceneInitialized = true;
	}

	updateModules(delta) {
		if (Sunniesnow.Music.loaded) {
			Sunniesnow.Music.update();
		}
		if (Sunniesnow.TouchManager.loaded) {
			Sunniesnow.TouchManager.update(delta);
		}
		if (Sunniesnow.DiscordRichPresence.connected) {
			Sunniesnow.DiscordRichPresence.update(delta);
		}
	}

	updateComponents(delta) {
		this.touchEffectsBoard?.update(delta);
		this.debugHud?.update(delta, {
			FPS: this.app.ticker.FPS,
			Time: Sunniesnow.Music.currentTime,
			Progress: Sunniesnow.Music.progress
		});
		this.debugBoard?.update(delta);
	}

	update(delta) {
		if (this.scene !== this.lastScene) {
			if (this.lastScene) {
				this.lastScene.terminate();
				this.lastScene.destroy();
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
		// Must be after scene.update() because of the joint effect of:
		// - ProgressControl.update() is called in scene.update() before uiNotesBoard.update(), but
		// - debugBoard.update() is called in updateComponents().
		// If the order is not right, touch areas may be doubly drawn.
		this.updateComponents(delta);
	}

	terminate() {
		this.terminating = true;
		this.scene?.terminate();
		if (Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.PinnedCoordinates.clear();
			Sunniesnow.Fullscreen.set(false);
			Sunniesnow.TouchManager.terminate();
			Sunniesnow.SpinUp.terminate();
			Sunniesnow.Popup.close();
			Sunniesnow.Sscharter.disconnect();
			Sunniesnow.DiscordRichPresence.terminate();
		}
		Sunniesnow.Audio.stopAll();
		if (!this.app) {
			return;
		}
		try {
			this.app.stop();
			this.app.destroy();
		} catch (err) {
			Sunniesnow.Logs.error(`Failed to stop game: ${err.message ?? err}`, err);
		}
		Sunniesnow.game = null;
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

	postLoading() {
		this.initInteraction();
		this.initAuxiliaryBoard();
	}

	initInteraction() {
		if (this.settings.touchEffects) {
			this.touchEffectsBoard = new Sunniesnow.TouchEffectsBoard();
			this.app.stage.addChild(this.touchEffectsBoard);
		}
		if (this.settings.debug) {
			this.debugHud = new Sunniesnow.DebugHud();
			this.debugBoard = new Sunniesnow.DebugBoard();
			this.app.stage.addChild(this.debugHud);
			this.app.stage.addChild(this.debugBoard);
		}
		this.initLevel();
		this.hidePauseUi = this.settings.hidePauseUi;
	}

	// this.auxiliaryBoard is a nice place that you can use to grab transformation matrices.
	// It will never get transformed itself, and it will not be rendered.
	initAuxiliaryBoard() {
		this.auxiliaryBoard = new PIXI.Container();
		this.auxiliaryBoard.label = 'auxiliary-board';
		this.auxiliaryBoard.renderable = false;
		this.app.stage.addChild(this.auxiliaryBoard);
	}
};
