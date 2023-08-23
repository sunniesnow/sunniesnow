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
		this.background = new Sunniesnow.Background();
		this.progressBar = new Sunniesnow.ProgressBar();
		this.uiBgPatternBoard = new Sunniesnow.UiBgPatternBoard();
		this.topLeftHud = new Sunniesnow.TopLeftHud();
		this.topRightHud = new Sunniesnow.TopRightHud();
		this.topCenterHud = new Sunniesnow.TopCenterHud();
		this.pauseButton = new Sunniesnow.ButtonPause();
		this.uiBgNotesBoard = new Sunniesnow.UiBgNotesBoard();
		this.doubleLinesBoard = new Sunniesnow.DoubleLinesBoard();
		this.tipPointsBoard = new Sunniesnow.TipPointsBoard();
		this.fxBoard = new Sunniesnow.FxBoard();
		this.pauseBoard = new Sunniesnow.PauseBoard(this);
		this.uiNotesBoard = new Sunniesnow.UiNotesBoard(this.fxBoard, this.doubleLinesBoard, this.debugBoard);
		this.addChild(this.background);
		this.addChild(this.progressBar);
		this.addChild(this.uiBgPatternBoard);
		this.addChild(this.topLeftHud);
		this.addChild(this.topRightHud);
		this.addChild(this.topCenterHud);
		this.addChild(this.pauseButton);
		this.addChild(this.fxBoard.back);
		this.addChild(this.uiBgNotesBoard);
		this.addChild(this.doubleLinesBoard);
		this.addChild(this.uiNotesBoard);
		this.addChild(this.tipPointsBoard);
		this.addChild(this.fxBoard);
		this.addChild(this.pauseBoard);
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
			this.doubleLinesBoard,
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
		this.doubleLinesBoard.update(delta);
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
		this.doubleLinesBoard.clear();
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
