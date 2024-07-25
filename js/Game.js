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

	mainTicker(delta) {
		if (!this.sceneInitialized) {
			this.initScene();
		}
		this.update(delta);
	}

	async initPixiApp() {
		// Application init will be async in PIXI v8
		// https://pixijs.com/8.x/guides/migrations/v8#async-initialisation
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
		/*if (this.settings.renderer === 'canvas') {
			this.maxTextureSize = Infinity
		} else {
			const gl = this.app.renderer.gl;
			this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		}*/
		this.app.ticker.add(this.mainTicker.bind(this));
	}

	initLevel() {
		this.level = new Sunniesnow.Level();
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
		Sunniesnow.Sscharter.disconnect();
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
