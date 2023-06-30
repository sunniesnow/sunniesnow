Sunniesnow.Game = class Game {
	static run() {
		Sunniesnow.Utils.clearWarningsAndErrors();
		if (Sunniesnow.game) {
			Sunniesnow.game.terminate();
		}
		Sunniesnow.game = new this();
		Sunniesnow.game.start();
		Sunniesnow.game.app.ticker.add(Sunniesnow.game.update.bind(Sunniesnow.game));
	}

	start() {
		Sunniesnow.Loader.readSettings(this);
		Sunniesnow.Audio.initialize();
		this.initUiEvents();
		this.initFx();
		this.initTipPoint();
		this.initPixiApp();
		this.chart = new Sunniesnow.Chart(Sunniesnow.Loader.loaded.chart.charts[this.settings.chartSelect]);
		this.scene = new Sunniesnow.SceneGame();
	}

	initUiEvents() {
		Sunniesnow.UiEvent.initialize();
		Sunniesnow.UiNote.initialize();
		Sunniesnow.UiTap.initialize();
		Sunniesnow.UiHold.initialize();
		Sunniesnow.UiFlick.initialize();
		Sunniesnow.UiDrag.initialize();
	}

	initFx() {
		Sunniesnow.FxNote.initialize();
		Sunniesnow.FxTap.initialize();
		Sunniesnow.FxHold.initialize();
		Sunniesnow.FxFlick.initialize();
		Sunniesnow.FxDrag.initialize();
	}

	initTipPoint() {
		Sunniesnow.TipPoint.initialize();
	}

	initPixiApp() {
		this.app = new PIXI.Application({
			width: this.settings.width,
			height: this.settings.height,
			view: document.getElementById('main-canvas'),
			forceCanvas: this.settings.backend == 'canvas',
			backgroundColor: 'black',
			antialias: true
		});
		if (this.settings.fullscreen) {
			this.setFullscreen(true);
		}
	}

	setFullscreen(fullscreen) {
		this.shouldFullscreen = fullscreen;
		this.needsHandleFullscreen = true;
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
		this.setFullscreen(false);
		Sunniesnow.Audio.stopAll();
		this.app.stop();
	}
};
