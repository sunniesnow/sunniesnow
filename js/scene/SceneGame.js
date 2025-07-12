Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
		this.populateUiAndBoards();
		this.populateAudio();
		this.populateHaptics();
		this.initInteraction();
	}

	populateUiAndBoards() {
		this.background = new Sunniesnow.Background();
		this.progressBar = new Sunniesnow.ProgressBar();
		if (!Sunniesnow.game.settings.hideBgPattern) {
			this.uiBgPatternBoard = new Sunniesnow.UiBgPatternBoard();
		}
		this.topLeftHud = new Sunniesnow.TopLeftHud();
		this.topRightHud = new Sunniesnow.TopRightHud();
		this.topCenterHud = new Sunniesnow.TopCenterHud();
		this.pauseBoard = new Sunniesnow.PauseBoard();
		this.pauseButton = new Sunniesnow.ButtonPause(this.pauseBoard);
		if (!Sunniesnow.game.settings.disableOrnament) {
			this.uiImagesBoard = new Sunniesnow.UiImagesBoard();
		}
		if (!Sunniesnow.game.settings.hideBgNotes) {
			this.uiBgNotesBoard = new Sunniesnow.UiBgNotesBoard();
		}
		if (!Sunniesnow.game.settings.hideTipPoints) {
			this.tipPointsBoard = new Sunniesnow.TipPointsBoard();
		}
		if (!Sunniesnow.game.settings.hideFx) {
			this.fxBoard = new Sunniesnow.FxBoard();
		}
		if (!Sunniesnow.game.settings.hideNotes) {
			this.doubleLinesBoard = new Sunniesnow.DoubleLinesBoard();
		}
		if (Sunniesnow.game.settings.scroll) {
			this.judgementLine = new Sunniesnow.JudgementLine();
		}
		if (!Sunniesnow.game.settings.hideNotes || !Sunniesnow.game.settings.hideCircles) {
			this.uiNotesBoard = new Sunniesnow.UiNotesBoard();
		}
		this.background.addTo(this);
		this.uiBgPatternBoard?.addTo(this);
		this.uiImagesBoard?.addTo(this);
		this.progressBar.addTo(this);
		this.topLeftHud.addTo(this);
		this.topRightHud.addTo(this);
		this.topCenterHud.addTo(this);
		this.pauseButton.addTo(this);
		this.fxBoard?.addTo(this);
		this.judgementLine?.addTo(this);
		this.uiBgNotesBoard?.addTo(this);
		this.doubleLinesBoard?.addTo(this);
		this.uiNotesBoard?.addTo(this);
		this.uiNotesBoard?.circlesLayer?.addTo(this);
		this.tipPointsBoard?.addTo(this);
		this.fxBoard?.frontLayer.addTo(this);
		this.pauseBoard.addTo(this);
	}

	populateAudio() {
		if (Sunniesnow.game.settings.seWithMusic) {
			this.seWithMusic = new Sunniesnow.SeWithMusic();
		}
		Sunniesnow.Music.playFromBeginning();
	}

	populateHaptics() {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		Sunniesnow.VibrationManager.start();
		if (Sunniesnow.game.settings.vibrationWithMusic) {
			this.vibrationWithMusic = new Sunniesnow.VibrationWithMusic();
		}
	}

	initInteraction() {
		if (Sunniesnow.game.progressAdjustable) {
			Sunniesnow.ProgressControl.init(this);
		}
		if (Sunniesnow.game.settings.debug) {
			Sunniesnow.EventInfoTip.init(this.uiNotesBoard, this.uiBgNotesBoard, this.uiBgPatternBoard);
		}
	}

	update(delta) {
		super.update(delta);
		this.updateAudioAndHaptics();
		if (Sunniesnow.game.progressAdjustable) {
			Sunniesnow.ProgressControl.update(delta);
		}
		if (!Sunniesnow.Music.pausing) {
			Sunniesnow.game.level.update();
			if (Sunniesnow.game.level.finished) {
				this.gotoResult();
			}
		}
		this.updateUiComponents(delta);
		this.updateBoards(delta);
	}

	gotoResult() {
		Sunniesnow.game.goto(new Sunniesnow.SceneResult([
			this.background,
			this.uiImagesBoard,
			this.progressBar,
			this.uiBgPatternBoard,
			this.fxBoard,
			this.uiBgNotesBoard,
			this.doubleLinesBoard,
			this.uiNotesBoard,
			this.tipPointsBoard,
			this.fxBoard.front
		]));
	}

	updateAudioAndHaptics() {
		this.seWithMusic?.update();
		this.vibrationWithMusic?.update();
	}

	// except fxBoard
	updateBoards(delta) {
		this.uiImagesBoard?.update(delta);
		this.uiBgPatternBoard?.update(delta);
		this.uiBgNotesBoard?.update(delta);
		this.uiNotesBoard?.update(delta);
		// Must be after uiNotesBoard.update() because double lines use uiNotes positions.
		this.doubleLinesBoard?.update(delta);
		this.tipPointsBoard?.update(delta);
		if (Sunniesnow.game.settings.alwaysUpdateFx || !Sunniesnow.Music.pausing) {
			this.fxBoard?.update(delta);
		}
	}

	terminate() {
		super.terminate();
		if (Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.VibrationManager.terminate();
		}
		this.pauseBoard.destroy({children: true});
		this.pauseButton.destroy({children: true});
		this.judgementLine?.destroy({children: true});
	}

	retry() {
		Sunniesnow.game.level.finish();
		this.fxBoard?.removeLevelEventListeners();
		Sunniesnow.game.initLevel();
		this.uiBgPatternBoard?.clear();
		this.uiBgNotesBoard?.clear();
		this.doubleLinesBoard?.clear();
		this.uiNotesBoard?.clear();
		this.tipPointsBoard?.clear();
		this.fxBoard?.clear();
		this.seWithMusic?.clear();
		this.vibrationWithMusic?.clear();
		Sunniesnow.Music.playFromBeginning();
	}

	updateUiComponents(delta) {
		this.background.update(delta);
		this.topLeftHud.update(delta, this.getUiText('hudTopLeft'));
		this.topRightHud.update(delta, this.getUiText('hudTopRight'));
		this.topCenterHud.update(delta, this.getUiText('hudTopCenter'));
		this.progressBar.update(delta, Sunniesnow.Music.progress);
		this.pauseBoard.update(delta);
		this.pauseButton.update(delta);
		this.judgementLine?.update(delta);
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
		if (Sunniesnow.game.level.finished) {
			return;
		}
		this.uiBgPatternBoard?.adjustProgress(time);
		this.uiImagesBoard?.adjustProgress(time);
		this.uiBgNotesBoard?.adjustProgress(time);
		this.uiNotesBoard?.adjustProgress(time);
		// Must be after uiNotesBoard.update() because double lines use uiNotes positions.
		this.doubleLinesBoard?.adjustProgress(time);
		this.tipPointsBoard?.adjustProgress(time);
		this.seWithMusic?.adjustProgress(time);
		Sunniesnow.game.level.adjustProgress(time);
		if (method === 'pause') {
			Sunniesnow.game.hidePauseUi = Sunniesnow.game.settings.hidePauseUi;
		}
		this.background.adjustProgress(time);
		this.topLeftHud.adjustProgress(time);
		this.topRightHud.adjustProgress(time);
		this.topCenterHud.adjustProgress(time);
		this.progressBar.adjustProgress(time);
		Sunniesnow.game.level.lastPause = false;
	}

};
