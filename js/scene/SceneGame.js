Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
		this.addListeners();
		this.populateUiAndBoards();
		this.populateAudio();
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

	populateAudio() {
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic = new Sunniesnow.SeWithMusic();
		}
		Sunniesnow.Music.playFromBeginning();
	}

	update(delta) {
		super.update(delta);
		this.updateAudio();
		this.updateUiComponents(delta);
		this.updateTouches();
		if (!Sunniesnow.Music.pausing) {
			Sunniesnow.game.level.update();
			this.updateBoards(delta);
			if (Sunniesnow.game.level.finished) {
				Sunniesnow.game.scene = new Sunniesnow.SceneResult();
			}
		}
		if (Sunniesnow.game.settings.debug) {
			this.debugHud.update(delta, {
				FPS: Sunniesnow.game.app.ticker.FPS,
				Time: Sunniesnow.Music.currentTime
			});
			this.debugBoard.update(delta);
		}
	}

	updateAudio() {
		Sunniesnow.Music.update();
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic.update();
		}
	}
	
	updateTouches() {
		Sunniesnow.TouchManager.update();
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
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic.clear();
		}
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

	addTouchListeners() {
		this.touchStartListener = event => {
			event.preventDefault();
			if (this.pauseBoard.triggerIfContainsPage(event.pageX, event.pageY) || this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				this.maskedTouches = event.changedTouches;
				return;
			}
			Sunniesnow.TouchManager.touchStart(event);
		};
		this.touchMoveListener = event => {
			event.preventDefault();
			Sunniesnow.TouchManager.touchMove(event);
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
			Sunniesnow.TouchManager.touchEnd(event);
		};
		Sunniesnow.game.canvas.addEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.addEventListener('touchmove', this.touchMoveListener);
		Sunniesnow.game.canvas.addEventListener('touchend', this.touchEndListener);
	}

	addKeyListeners() {
		this.keydownListener = event => {
			if (!/^F\d+$/.test(event.key)) {
				event.preventDefault();
			}
			if (event.key === '`') {
				this.switchPausing();
				return;
			}
			Sunniesnow.TouchManager.keyDown(event);
		};
		this.keyupListener = event => {
			event.preventDefault();
			Sunniesnow.TouchManager.keyUp(event);
		};
		window.addEventListener('keydown', this.keydownListener);
		window.addEventListener('keyup', this.keyupListener);
	}

	addMouseListeners() {
		this.mouseDownListener = event => {
			event.preventDefault();
			if (this.pauseBoard.triggerIfContainsPage(event.pageX, event.pageY) || this.pauseButton.triggerIfContainsPage(event.pageX, event.pageY)) {
				return;
			}
			Sunniesnow.TouchManager.mouseDown(event);
		};
		this.mouseMoveListener = event => {
			event.preventDefault();
			Sunniesnow.TouchManager.mouseMove(event);
		};
		this.mouseUpListener = event => {
			event.preventDefault();
			Sunniesnow.TouchManager.mouseUp(event);
		};
		Sunniesnow.game.canvas.addEventListener('mousemove', this.mouseMoveListener);
		Sunniesnow.game.canvas.addEventListener('mousedown', this.mouseDownListener);
		Sunniesnow.game.canvas.addEventListener('mouseup', this.mouseUpListener);
	}

	addBlurListeners() {
		this.blurListener = event => {
			Sunniesnow.TouchManager.clear();
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
