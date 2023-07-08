Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
		this.clearTouches();
		this.addListeners();
		this.populateUiAndBoards();
		Sunniesnow.Music.playFromBeginning();
	}

	populateUiAndBoards() {
		if (Sunniesnow.game.settings.debug) {
			this.debugHud = new Sunniesnow.DebugHud();
			this.debugBoard = new Sunniesnow.DebugBoard();
		}
		this.addChild(this.background = new Sunniesnow.Background());
		this.addChild(this.progressBar = new Sunniesnow.ProgressBar());
		this.addChild(this.uiBgPatternBoard = new Sunniesnow.UiBgPatternBoard());
		this.addChild(this.topLeftHud = new Sunniesnow.TopLeftHud());
		this.addChild(this.topRightHud = new Sunniesnow.TopRightHud());
		this.addChild(this.topCenterHud = new Sunniesnow.TopCenterHud());
		this.addChild(this.pauseButton = new Sunniesnow.ButtonPause(() => this.switchPausing()));
		this.addChild(this.fxBoard = new Sunniesnow.FxBoard());
		this.addChild(this.uiBgNotesBoard = new Sunniesnow.UiBgNotesBoard());
		this.addChild(this.uiNotesBoard = new Sunniesnow.UiNotesBoard(this.fxBoard, this.debugBoard));
		this.addChild(this.tipPointsBoard = new Sunniesnow.TipPointsBoard());
		this.addChild(this.pauseBoard = new Sunniesnow.PauseBoard(this));
		if (Sunniesnow.game.settings.debug) {
			this.addChild(this.debugHud);
			this.addChild(this.debugBoard);
		}
	}

	update(delta) {
		super.update(delta);
		Sunniesnow.Music.update();
		this.updateUiComponents(delta);
		this.updateTouches();
		if (!Sunniesnow.Music.pausing) {
			Sunniesnow.game.level.update();
			this.updateBoards(delta);
		}
		if (Sunniesnow.game.settings.debug) {
			this.debugHud.update(delta, {
				FPS: Sunniesnow.game.app.ticker.FPS,
				Time: Sunniesnow.Music.currentTime
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
		this.uiBgPatternBoard.update(delta);
		this.uiBgNotesBoard.update(delta);
		this.uiNotesBoard.update(delta);
		this.fxBoard.update(delta);
		this.tipPointsBoard.update(delta);
	}

	terminate() {
		super.terminate();
		this.removeListeners();
	}

	switchPausing() {
		if (Sunniesnow.Music.pausing) {
			this.resume();
		} else {
			this.pause();
		}
	}

	pause() {
		if (!Sunniesnow.Music.pause()) {
			return;
		}
		this.pauseBoard.visible = true;
		Sunniesnow.game.canvas.canHaveContextMenu = true;
	}

	resume() {
		if (!Sunniesnow.Music.resume()) {
			return;
		}
		this.pauseBoard.visible = false;
		Sunniesnow.game.canvas.canHaveContextMenu = false;
	}

	retry() {
		Sunniesnow.game.level = new Sunniesnow.Level();
		this.uiBgPatternBoard.clear();
		this.uiBgNotesBoard.clear();
		this.uiNotesBoard.clear();
		this.tipPointsBoard.clear();
		this.fxBoard.clear();
		Sunniesnow.Music.playFromBeginning();
		this.pauseBoard.visible = false;
	}

	updateUiComponents(delta) {
		this.topLeftHud.update(delta, this.getUiText('hudTopLeft'));
		this.topRightHud.update(delta, this.getUiText('hudTopRight'));
		this.topCenterHud.update(delta, this.getUiText('hudTopCenter'));
		this.progressBar.update(delta, Sunniesnow.Music.progress);
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
		if (Sunniesnow.Music.pausing || Sunniesnow.game.settings.autoplay) {
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
		Sunniesnow.game.level.onTouch(touches);
		if (Sunniesnow.game.settings.debug) {
			this.debugBoard.updateTouches(touches);
		}
		this.needUpdateTouches = false;
	}

	clearTouches() {
		this.touches = [];
		this.keys = {};
		this.mouseButtons = 0;
		this.maskedTouches = [];
		this.maskedMouseButtons = 0;
	}

	addTouchListeners() {
		this.touchStartListener = event => {
			event.preventDefault();
			if (this.pauseBoard.triggerIfContainsPage(event.pageX, event.pageY) || this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				this.maskedTouches = event.changedTouches;
				return;
			}
			this.touches = event.touches.filter(touch => !this.maskedTouches.includes(touch));
			this.onTouch();
		};
		this.touchMoveListener = event => {
			event.preventDefault();
			this.touches = event.touches.filter(touch => !this.maskedTouches.includes(touch));
			this.onTouch();
		};
		this.touchEndListener = event => {
			event.preventDefault();
			for (let i = 0; i < this.maskedTouches.length;) {
				if (event.changedTouches.includes(this.maskedTouches[i])) {
					this.maskedTouches.splice(i, 1);
				} else {
					i++;
				}
			}
			this.touches = event.touches.filter(touch => !this.maskedTouches.includes(touch));
			this.onTouch();
		};
		Sunniesnow.game.canvas.addEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.addEventListener('touchmove', this.touchMoveListener);
		Sunniesnow.game.canvas.addEventListener('touchend', this.touchEndListener);
	}

	addKeyListeners() {
		this.keydownListener = event => {
			if (event.key === '`') {
				this.switchPausing();
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
	}

	addMouseListeners() {
		this.mouseDownListener = event => {
			event.preventDefault();
			if (this.pauseBoard.triggerIfContainsPage(event.pageX, event.pageY) || this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				this.maskedMouseButtons |= 1 << event.button;
				return;
			}
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
			this.mouseButtons = event.buttons & ~this.maskedMouseButtons;
			this.onTouch();
		};
		this.mouseMoveListener = event => {
			event.preventDefault();
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
			this.mouseButtons = event.buttons & ~this.maskedMouseButtons;;
			this.onTouch();
		};
		this.mouseUpListener = event => {
			event.preventDefault();
			this.maskedMouseButtons &= ~(1 << event.button);
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
			this.mouseButtons = event.buttons & ~this.maskedMouseButtons;;
			this.onTouch();
		};
		Sunniesnow.game.canvas.addEventListener('mousemove', this.mouseMoveListener);
		Sunniesnow.game.canvas.addEventListener('mousedown', this.mouseDownListener);
		Sunniesnow.game.canvas.addEventListener('mouseup', this.mouseUpListener);
	}

	addBlurListeners() {
		this.blurListener = event => {
			this.clearTouches();
			this.pause();
		};
		window.addEventListener('blur', this.blurListener);
	}

	addListeners() {
		this.addBlurListeners();
		this.addTouchListeners();
		this.addKeyListeners();
		this.addMouseListeners();
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
