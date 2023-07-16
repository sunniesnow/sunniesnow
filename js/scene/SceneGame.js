Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
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
		this.addChild(this.pauseButton = new Sunniesnow.ButtonPause());
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
		if (!Sunniesnow.Music.pausing) {
			Sunniesnow.game.level.update();
			this.updateBoards(delta);
			if (Sunniesnow.game.level.finished) {
				this.gotoResult();
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

	gotoResult() {
		Sunniesnow.game.goto(new Sunniesnow.SceneResult([
			this.background,
			this.progressBar,
			this.uiBgPatternBoard,
			this.fxBoard,
			this.uiBgNotesBoard,
			this.uiNotesBoard,
			this.tipPointsBoard,
		]));
	}

	updateAudio() {
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic.update();
		}
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
		this.pauseBoard.destroy({children: true});
		this.pauseButton.destroy({children: true});
	}

	retry() {
		Sunniesnow.game.level.finish();
		Sunniesnow.game.initLevel();
		this.uiBgPatternBoard.clear();
		this.uiBgNotesBoard.clear();
		this.uiNotesBoard.clear();
		this.tipPointsBoard.clear();
		this.fxBoard.clear();
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic.clear();
		}
		Sunniesnow.Music.playFromBeginning();
	}

	updateUiComponents(delta) {
		this.background.update(delta);
		this.topLeftHud.update(delta, this.getUiText('hudTopLeft'));
		this.topRightHud.update(delta, this.getUiText('hudTopRight'));
		this.topCenterHud.update(delta, this.getUiText('hudTopCenter'));
		this.progressBar.update(delta);
		this.pauseBoard.update(delta);
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
				return Sunniesnow.game.level.accuracyText();
		}
	}

};
