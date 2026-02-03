Sunniesnow.Game = class Game {
	static async run(overrideSettings) {
		if (Sunniesnow.game && !Sunniesnow.game.terminating) {
			if (!Sunniesnow.Loader.loadingComplete) {
				Sunniesnow.Logs.warn('Still loading');
				return;
			}
			try {
				Sunniesnow.game.terminate();
			} catch (e) {
				Sunniesnow.Logs.error(`Failed to terminate the previous game: ${e}`, e);
			}
		}
		Sunniesnow.game = new this();
		// game.settings will be replaced with await mainSettings.get() in Settings.load().
		// The reason for this two-stage initialization is that get() is async and slow,
		// but some settings can be used immediately, among which are the settings that are needed to initialize Pixi app.
		Sunniesnow.game.settings = Object.assign(Sunniesnow.Settings.mainSettings.value(), overrideSettings);
		Sunniesnow.game.overrideSettings = overrideSettings;
		await Sunniesnow.Loader.load();
	}

	static async offsetWizard() {
		await this.run({
			levelFile: 'online',
			levelFileOnline: 'offset-wizard',
			volumeSe: 0,
			autoplay: false,
			chartOffset: 0
		});
	}

	mainTicker({deltaTime}) {
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
		switch (this.settings.renderer) {
			case 'canvas':
				break;
			case 'webgl':
				appOptions.preferWebGLVersion = this.settings.glVersion;
				appOptions.antialias = this.settings.glAntialias;
				appOptions.powerPreference = this.settings.glPowerPreference;
				break;
			case 'webgpu':
				appOptions.antialias = this.settings.gpuAntialias;
				appOptions.powerPreference = this.settings.gpuPowerPreference;
				break;
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
		this.initScene();
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
		this.app.destroy({
			releaseGlobalResources: true // https://github.com/pixijs/pixijs/discussions/11678
		});
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

	togglePauseUi() {
		this.hidePauseUi = !this.hidePauseUi;
	}

	retry() {
		if (this.scene instanceof Sunniesnow.SceneGame) {
			this.scene.retry();
		} else if (this.scene instanceof Sunniesnow.SceneResult) {
			this.scene.gotoGame();
		}
	}

	postLoading() {
		if (!Sunniesnow.Loader.loadingModulesComplete) {
			return;
		}
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
