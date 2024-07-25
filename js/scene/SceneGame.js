Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
		this.populateUiAndBoards();
		this.populateAudio();
		if (Sunniesnow.game.progressAdjustable) {
			Sunniesnow.ProgressControl.init(this);
		}
	}

	populateUiAndBoards() {
		this.background = new Sunniesnow.Background();
		this.progressBar = new Sunniesnow.ProgressBar();
		this.uiBgPatternBoard = new Sunniesnow.UiBgPatternBoard();
		this.topLeftHud = new Sunniesnow.TopLeftHud();
		this.topRightHud = new Sunniesnow.TopRightHud();
		this.topCenterHud = new Sunniesnow.TopCenterHud();
		this.pauseBoard = new Sunniesnow.PauseBoard(this);
		this.pauseButton = new Sunniesnow.ButtonPause(this.pauseBoard);
		this.uiBgNotesBoard = new Sunniesnow.UiBgNotesBoard();
		this.doubleLinesBoard = new Sunniesnow.DoubleLinesBoard();
		if (!Sunniesnow.game.settings.hideTipPoints) {
			this.tipPointsBoard = new Sunniesnow.TipPointsBoard();
		}
		this.fxBoard = new Sunniesnow.FxBoard();
		this.uiNotesBoard = new Sunniesnow.UiNotesBoard(this.fxBoard);
		this.addChild(this.background);
		this.addChild(this.progressBar);
		this.addChild(this.uiBgPatternBoard);
		this.addChild(this.topLeftHud);
		this.addChild(this.topRightHud);
		this.addChild(this.topCenterHud);
		this.addChild(this.pauseButton);
		this.addChild(this.fxBoard);
		this.addChild(this.uiBgNotesBoard);
		this.addChild(this.doubleLinesBoard);
		this.addChild(this.uiNotesBoard);
		if (!Sunniesnow.game.settings.hideTipPoints) {
			this.addChild(this.tipPointsBoard);
		}
		if (!Sunniesnow.game.settings.hideFxInFront) {
			this.addChild(this.fxBoard.front);
		}
		this.addChild(this.pauseBoard);
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
		if (Sunniesnow.game.progressAdjustable) {
			Sunniesnow.ProgressControl.update(delta);
		}
		this.updateUiComponents(delta);
		this.updateBoards(delta);
		if (!Sunniesnow.Music.pausing) {
			Sunniesnow.game.level.update();
			if (Sunniesnow.game.level.finished) {
				this.gotoResult();
			}
		}
	}

	gotoResult() {
		const boards = [
			this.background,
			this.progressBar,
			this.uiBgPatternBoard,
			this.fxBoard,
			this.uiBgNotesBoard,
			this.doubleLinesBoard,
			this.uiNotesBoard
		];
		if (!Sunniesnow.game.settings.hideTipPoints) {
			boards.push(this.tipPointsBoard);
		}
		if (!Sunniesnow.game.settings.hideFxInFront) {
			boards.push(this.fxBoard.front);
		}
		Sunniesnow.game.goto(new Sunniesnow.SceneResult(boards));
	}

	updateAudio() {
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic.update();
		}
	}
	
	// except fxBoard
	updateBoards(delta) {
		this.uiBgPatternBoard.update(delta);
		this.uiBgNotesBoard.update(delta);
		this.doubleLinesBoard.update(delta);
		this.uiNotesBoard.update(delta);
		if (!Sunniesnow.game.settings.hideTipPoints) {
			this.tipPointsBoard.update(delta);
		}
		if (Sunniesnow.game.settings.alwaysUpdateFx || !Sunniesnow.Music.pausing) {
			this.fxBoard.update(delta);
		}
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
		if (!Sunniesnow.game.settings.hideTipPoints) {
			this.tipPointsBoard.clear();
		}
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
		this.pauseButton.update(delta);
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

	// method: seek | play | pause
	adjustProgress(time, method = 'seek') {
		Sunniesnow.Music[method](time);
		this.uiBgPatternBoard.adjustProgress(time);
		this.uiBgNotesBoard.adjustProgress(time);
		this.doubleLinesBoard.adjustProgress(time);
		this.uiNotesBoard.adjustProgress(time);
		if (!Sunniesnow.game.settings.hideTipPoints) {
			this.tipPointsBoard.adjustProgress(time);
		}
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic.adjustProgress(time);
		}
		Sunniesnow.game.level.adjustProgress(time);
		if (method === 'pause') {
			Sunniesnow.game.hidePauseUi = Sunniesnow.game.settings.hidePauseUi;
		}
		Sunniesnow.game.level.lastPause = false;
	}

};
