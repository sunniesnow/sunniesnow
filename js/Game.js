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
		this.loadClasses();
		this.initPixiApp();
		this.initLevel();
		this.scene = new Sunniesnow.SceneGame();
	}

	mainTicker(delta) {
		if (this.loadingComplete) {
			this.update(delta);
		} else {
			this.updateLoading(delta);
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
		this.canvas.canHaveContextMenu = false;
	}

	loadClasses() {
		this.loadingProgress = 0;
		this.targetLoadingProgress = 0;
		this.loadAudio();
		this.loadUiComponents();
		this.loadUiPause();
		this.loadButtons();
		this.loadUiEvents();
		this.loadFx();
		this.loadTipPoint();
	}

	loadAudio() {
		this.loadClass('Audio');
		this.loadClass('Music');
		this.loadClass('SeTap');
		this.loadClass('SeHold');
		this.loadClass('SeFlick');
		this.loadClass('SeDrag');
	}

	loadButtons() {
		this.loadClass('ButtonPause');
	}

	loadUiPause() {
		this.loadClass('PauseBackground');
		this.loadClass('ButtonResume');
		this.loadClass('ButtonRetry');
		this.loadClass('ButtonFullscreen');
	}

	loadUiComponents() {
		this.loadClass('Background');
		this.loadClass('ProgressBar');
		this.loadClass('TopCenterHud');
		this.loadClass('TopLeftHud');
		this.loadClass('TopRightHud');
	}

	loadUiEvents() {
		this.loadClass('UiNote');
		this.loadClass('UiTap');
		this.loadClass('UiHold');
		this.loadClass('UiFlick');
		this.loadClass('UiDrag');
		this.loadClass('UiBgNote');
		this.loadClass('UiBigText');
		this.loadClass('UiGrid');
		this.loadClass('UiHexagon');
		this.loadClass('UiCheckerboard');
		this.loadClass('UiDiamondGrid');
		this.loadClass('UiPentagon');
		this.loadClass('UiTurntable');
	}

	loadFx() {
		this.loadClass('FxTap');
		this.loadClass('FxHold');
		this.loadClass('FxFlick');
		this.loadClass('FxDrag');
	}

	loadTipPoint() {
		this.loadClass('TipPoint');
	}

	loadClass(name) {
		Sunniesnow[name].load().then(
			value => this.loadingProgress++,
			reason => Sunniesnow.Utils.error(`Failed to load Sunniesnow.${name}: ${reason}`)
		);
		this.targetLoadingProgress++;
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

	updateLoading(delta) {
		const element = document.getElementById('loading-progress');
		if (this.loadingProgress >= this.targetLoadingProgress) {
			element.style.display = 'none';
			this.loadingComplete = true;
		} else {
			element.style.display = '';
			element.innerHTML = `Loading: ${this.loadingProgress}/${this.targetLoadingProgress}`;
		}
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
		this.app.stop();
	}
};
