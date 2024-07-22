Sunniesnow.SpinUp = {
	async load() {
		await this.initPixiApp();
		await this.initCanvas();
		if (Sunniesnow.Utils.isBrowser()) {
			this.addWindowListeners();
		}
	},

	async initCanvas() {
		Sunniesnow.game.canvas = Sunniesnow.game.app.view;
		Sunniesnow.game.canvas.id = 'main-canvas';
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		if (Sunniesnow.game.settings.popup) {
			await Sunniesnow.Popup.create();
			Sunniesnow.game.window = Sunniesnow.Popup.window;
			document.getElementById('main-canvas').style.display = 'none';
		} else {
			Sunniesnow.game.window = window;
		}
		Sunniesnow.game.document = Sunniesnow.game.window.document;
		Sunniesnow.game.document.getElementById('main-canvas').replaceWith(Sunniesnow.game.canvas);
		this.addCanvasListeners();
		if (Sunniesnow.game.settings.fullscreenOnStart) {
			Sunniesnow.Fullscreen.set(true);
		}
	},

	addCanvasListeners() {
		this.canvasContextMenuListener = event => {
			const modifier = (navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey) || event.altKey;
			const pausing = Sunniesnow.Music.pausing || Sunniesnow.game.level.finished;
			let condition = Sunniesnow.game.settings.contextMenuPause && pausing;
			condition ||= Sunniesnow.game.settings.contextMenuPlay && !pausing;
			condition &&= !(Sunniesnow.game.settings.contextMenuNoModifier && modifier);
			if (condition) {
				Sunniesnow.TouchManager.clear();
			} else {
				event.preventDefault();
			}
		};
		Sunniesnow.game.canvas.addEventListener('contextmenu', this.canvasContextMenuListener);
		Sunniesnow.Fullscreen.addListenerToCanvas();
	},

	removeCanvasListeners() {
		if (!this.canvasContextMenuListener) {
			return;
		}
		Sunniesnow.game.canvas.removeEventListener('contextmenu', this.canvasContextMenuListener);
		Sunniesnow.Fullscreen.removeListenerFromCanvas();
	},

	addWindowListeners() {
		this.blurListener = event => {
			Sunniesnow.TouchManager.clear();
			if (Sunniesnow.Fullscreen.entering || Sunniesnow.Fullscreen.quitting) {
				return;
			}
			if (!Sunniesnow.game.level?.finished && Sunniesnow.game.sceneInitialized) {
				Sunniesnow.game.pause();
			}
		};
		if (Sunniesnow.game.settings.pauseFullscreen) {
			Sunniesnow.game.document.addEventListener('fullscreenchange', this.blurListener, true);
		}
		if (Sunniesnow.game.settings.pauseBlur) {
			Sunniesnow.game.window.addEventListener('blur', this.blurListener);
			Sunniesnow.game.document.addEventListener('visibilitychange', this.blurListener);
			Sunniesnow.game.document.addEventListener('pagehide', this.blurListener);
		}
	},

	removeWindowListeners() {
		if (!this.blurListener) {
			return;
		}
		if (Sunniesnow.game.settings.pauseFullscreen) {
			Sunniesnow.game.document.removeEventListener('fullscreenchange', this.blurListener);
		}
		if (Sunniesnow.game.settings.pauseBlur) {
			Sunniesnow.game.window.removeEventListener('blur', this.blurListener);
			Sunniesnow.game.document.removeEventListener('visibilitychange', this.blurListener);
			Sunniesnow.game.document.removeEventListener('pagehide', this.blurListener);
		}
	},

	async initPixiApp() {
		// Application init will be async in PIXI v8
		// https://pixijs.com/8.x/guides/migrations/v8#async-initialisation
		Sunniesnow.game.app = new PIXI.Application({
			hello: Sunniesnow.game.settings.debug,
			width: Sunniesnow.game.settings.width,
			height: Sunniesnow.game.settings.height,
			backgroundColor: 'black',
			eventFeatures: {
				click: false,
				globalMove: false,
				move: false,
				wheel: false
			},
			forceCanvas: Sunniesnow.game.settings.renderer === 'canvas',
			antialias: Sunniesnow.game.settings.antialias,
			powerPreference: Sunniesnow.game.settings.powerPreference,
			autoStart: Sunniesnow.Utils.isBrowser()
		});
		/*if (Sunniesnow.game.settings.renderer === 'canvas') {
			Sunniesnow.game.maxTextureSize = Infinity
		} else {
			const gl = Sunniesnow.game.app.renderer.gl;
			Sunniesnow.game.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		}*/
		Sunniesnow.game.app.ticker.add(Sunniesnow.game.mainTicker.bind(Sunniesnow.game));
	},

	terminate() {
		this.removeCanvasListeners();
		this.removeWindowListeners();
	}

};
