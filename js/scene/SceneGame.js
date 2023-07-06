Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
		this.started = false; // set to true when the music starts playing
		Sunniesnow.game.level = new Sunniesnow.Level();
		this.addListeners();
		if (Sunniesnow.game.settings.debug) {
			this.createDebugUi();
		}
		this.populateUiAndBoards();
		if (Sunniesnow.game.settings.debug) {
			this.populateDebugUi();
		}
		this.loadMusic();
	}

	createDebugUi() {
		this.debugHud = new Sunniesnow.DebugHud();
		this.debugBoard = new Sunniesnow.DebugBoard();
	}

	populateUiAndBoards() {
		this.addChild(this.background = new Sunniesnow.Background());
		this.addChild(this.progressBar = new Sunniesnow.ProgressBar());
		this.addChild(this.uiBgPatternBoard = new Sunniesnow.UiBgPatternBoard(Sunniesnow.game.chart.events));
		this.addChild(this.topLeftHud = new Sunniesnow.TopLeftHud());
		this.addChild(this.topRightHud = new Sunniesnow.TopRightHud());
		this.addChild(this.topCenterHud = new Sunniesnow.TopCenterHud());
		this.addChild(this.pauseButton = new Sunniesnow.ButtonPause(() => this.switchPausing()));
		this.addChild(this.fxBoard = new Sunniesnow.FxBoard());
		this.addChild(this.uiBgNotesBoard = new Sunniesnow.UiBgNotesBoard(Sunniesnow.game.chart.events));
		this.addChild(this.uiNotesBoard = new Sunniesnow.UiNotesBoard(Sunniesnow.game.chart.events, this.fxBoard, this.debugBoard));
		this.addChild(this.tipPointsBoard = new Sunniesnow.TipPointsBoard(Sunniesnow.game.chart.events));
	}

	populateDebugUi() {
		this.addChild(this.debugHud);
		this.addChild(this.debugBoard);
	}

	loadMusic() {
		const buffer = Sunniesnow.Loader.loaded.chart.music[Sunniesnow.game.settings.musicSelect];
		this.music = new Sunniesnow.Audio(buffer);
		this.music.playbackRate = Sunniesnow.game.settings.gameSpeed;
		this.music.addLoadListener(() => {
			const start = Math.min(0, Sunniesnow.game.chart.events[0].appearTime());
			const preperation = Sunniesnow.Config.preperationTime * Sunniesnow.game.settings.gameSpeed;
			this.music.play(start - preperation - Sunniesnow.game.settings.delay/1000);
			this.started = true;
		});
	}

	update(delta) {
		super.update(delta);
		this.updateUiComponents(delta);
		this.updateTouches();
		if (this.started && !this.pausing) {
			this.currentTime = this.music.currentTime();
			Sunniesnow.game.level.update(this.currentTime);
			this.updateBoards(delta);
		}
		if (Sunniesnow.game.settings.debug) {
			this.debugHud.update(delta, {
				FPS: Sunniesnow.game.app.ticker.FPS,
				Time: this.currentTime
			});
			this.debugBoard.update(delta);
		}
	}
	
	updateTouches() {
		if (this.needUpdateTouches) {
			this.onTouch();
		}
		this.needUpdateTouches = true;
	}

	updateBoards(delta) {
		this.uiBgPatternBoard.update(this.currentTime);
		this.uiBgNotesBoard.update(this.currentTime);
		this.uiNotesBoard.update(this.currentTime);
		this.fxBoard.update(delta);
		this.tipPointsBoard.update(this.currentTime);
	}

	terminate() {
		super.terminate();
		this.removeListeners();
	}

	switchPausing() {
		if (this.pausing) {
			this.resume();
		} else {
			this.pause();
		}
	}

	pause() {
		if (!this.started || this.pausing) {
			return;
		}
		this.currentTime = this.music.currentTime();
		this.music.stop();
		this.pausing = true;
	}

	resume() {
		if (!this.started || !this.pausing) {
			return;
		}
		this.music.play(this.currentTime - Sunniesnow.Config.resumePreperationTime);
		this.pausing = false;
	}

	updateUiComponents(delta) {
		this.topLeftHud.update(delta, this.getUiText('hudTopLeft'));
		this.topRightHud.update(delta, this.getUiText('hudTopRight'));
		this.topCenterHud.update(delta, this.getUiText('hudTopCenter'));
		this.progressBar.update(delta, this.currentTime / this.music.duration);
	}

	getUiText(ui) {
		switch (Sunniesnow.game.settings[ui]) {
			case 'none':
				return '';
			case 'title':
				return Sunniesnow.game.chart.title;
			case 'difficulty':
				return Sunniesnow.game.chart.difficulty;
			case 'difficulty-name':
				return Sunniesnow.game.chart.difficultyName;
			case 'difficulty-and-name':
				return Sunniesnow.game.chart.difficultyName + ' ' + Sunniesnow.game.chart.difficulty;
			case 'combo':
				return Sunniesnow.game.level.combo.toString();
			case 'score':
				return Sunniesnow.game.level.score().toString();
			case 'accuracy':
				return Sunniesnow.game.level.accuracy().toString();
		}
	}

	onTouch() {
		if (!this.started || this.pausing || Sunniesnow.game.settings.autoplay) {
			return;
		}
		const touches = [];
		for (let i = 0; i < this.touches.length; i++) {
			touches.push({
				identifier: `touch${this.touches[i].identifier}`,
				pageX: this.touches[i].pageX,
				pageY: this.touches[i].pageY
			});
		}
		for (const key in this.keys) {
			touches.push({
				identifier: `key${key}`,
				pageX: this.mouseX || 0,
				pageY: this.mouseY || 0
			});
		}
		for (let buttons = this.mouseButtons, i = 0; buttons > 0; buttons >>= 1, i++) {
			if (!(buttons & 1)) {
				continue;
			}
			touches.push({
				identifier: `mouse${i}`,
				pageX: this.mouseX || 0,
				pageY: this.mouseY || 0
			});
		}
		this.currentTime = this.music.currentTime();
		Sunniesnow.game.level.onTouch(touches, this.currentTime);
		if (Sunniesnow.game.settings.debug) {
			this.debugBoard.updateTouches(touches);
		}
		this.needUpdateTouches = false;
	}

	addListeners() {
		this.blurListener = event => {
			this.touches = [];
			this.keys = {};
			this.mouseButtons = 0;
			this.pause();
		};
		window.addEventListener('blur', this.blurListener);
		this.touches = [];
		this.touchListener = event => {
			event.preventDefault();
			this.touches = event.touches;
			this.onTouch();
		};
		this.touchStartListener = event => {
			event.preventDefault();
			if (this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				return;
			}
			this.touches = event.touches;
			this.onTouch();
		};
		Sunniesnow.game.canvas.addEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.addEventListener('touchmove', this.touchListener);
		Sunniesnow.game.canvas.addEventListener('touchend', this.touchListener);

		this.keys = {};
		this.keydownListener = event => {
			if (event.key === 'Escape') {
				event.preventDefault();
				this.pause();
				return;
			}
			this.keys[event.keyCode] = true;
			this.onTouch();
		};
		this.keyupListener = event => {
			delete this.keys[event.keyCode];
			this.onTouch();
		};
		window.addEventListener('keydown', this.keydownListener);
		window.addEventListener('keyup', this.keyupListener);

		this.mouseButtons = 0;
		this.mouseListener = event => {
			event.preventDefault();
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
			this.mouseButtons = event.buttons;
			this.onTouch();
		};
		this.mouseDownListener = event => {
			event.preventDefault();
			if (this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				return;
			}
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
			this.mouseButtons = event.buttons;
			this.onTouch();
		};
		Sunniesnow.game.canvas.addEventListener('mousemove', this.mouseListener);
		Sunniesnow.game.canvas.addEventListener('mousedown', this.mouseDownListener);
		Sunniesnow.game.canvas.addEventListener('mouseup', this.mouseListener);
	}

	removeListeners() {
		window.removeEventListener('blur', this.blurListener);
		Sunniesnow.game.canvas.removeEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.removeEventListener('touchmove', this.touchListener);
		Sunniesnow.game.canvas.removeEventListener('touchend', this.touchListener);
		window.removeEventListener('keydown', this.keydownListener);
		window.removeEventListener('keyup', this.keyupListener);
		Sunniesnow.game.canvas.removeEventListener('mousemove', this.mouseListener);
		Sunniesnow.game.canvas.removeEventListener('mousedown', this.mouseDownListener);
		Sunniesnow.game.canvas.removeEventListener('mouseup', this.mouseListener);
	}

};
