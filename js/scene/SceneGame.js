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
		// See Image.LAYER_ABOVE for available properties of uiImageBoard.layerAbove.
		this.uiImagesBoard?.layerAbove.none.addTo(this);
		this.background.addTo(this);
		this.uiImagesBoard?.layerAbove.background.addTo(this);
		this.uiBgPatternBoard?.addTo(this);
		this.uiImagesBoard?.layerAbove.bgPattern.addTo(this);
		this.progressBar.addTo(this);
		this.topLeftHud.addTo(this);
		this.topRightHud.addTo(this);
		this.topCenterHud.addTo(this);
		this.pauseButton.addTo(this);
		this.uiImagesBoard?.layerAbove.hud.addTo(this);
		this.fxBoard?.addTo(this);
		this.uiImagesBoard?.layerAbove.fx.addTo(this);
		this.judgementLine?.addTo(this);
		this.uiImagesBoard?.layerAbove.judgementLine.addTo(this);
		this.uiBgNotesBoard?.addTo(this);
		this.uiImagesBoard?.layerAbove.bgNotes.addTo(this);
		this.doubleLinesBoard?.addTo(this);
		this.uiNotesBoard?.addTo(this);
		this.uiImagesBoard?.layerAbove.notes.addTo(this);
		this.uiNotesBoard?.circles?.addTo(this);
		this.uiImagesBoard?.layerAbove.circles.addTo(this);
		this.tipPointsBoard?.addTo(this);
		this.uiImagesBoard?.layerAbove.tipPoints.addTo(this);
		this.fxBoard?.frontLayer.addTo(this);
		this.uiImagesBoard?.layerAbove.fxFront.addTo(this);
		this.pauseBoard.addTo(this);
		if (!Sunniesnow.game.settings.disableOrnament) {
			// See EffectMultiple.LAYERS for available layers.
			this.uiEffectsBoard = new Sunniesnow.UiEffectsBoard(this, {
				imagesAboveNone: this.uiImagesBoard?.layerAbove.none,
				background: this.background,
				imagesAboveBackground: this.uiImagesBoard?.layerAbove.background,
				bgPattern: this.uiBgPatternBoard,
				imagesAboveBgPattern: this.uiImagesBoard?.layerAbove.bgPattern,
				hud: [this.progressBar, this.topLeftHud, this.topRightHud, this.topCenterHud],
				imagesAboveHud: this.uiImagesBoard?.layerAbove.hud,
				fx: this.fxBoard,
				imagesAboveFx: this.uiImagesBoard?.layerAbove.fx,
				judgementLine: this.judgementLine,
				imagesAboveJudgementLine: this.uiImagesBoard?.layerAbove.judgementLine,
				bgNotes: this.uiBgNotesBoard,
				imagesAboveBgNotes: this.uiImagesBoard?.layerAbove.bgNotes,
				notes: [this.doubleLinesBoard, this.uiNotesBoard],
				imagesAboveNotes: this.uiImagesBoard?.layerAbove.notes,
				circles: this.uiNotesBoard?.circles,
				imagesAboveCircles: this.uiImagesBoard?.layerAbove.circles,
				tipPoints: this.tipPointsBoard,
				imagesAboveTipPoints: this.uiImagesBoard?.layerAbove.tipPoints,
				fxFront: this.fxBoard.frontLayer,
				imagesAboveFxFront: this.uiImagesBoard?.layerAbove.fxFront
			});
		}
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
			this.uiImagesBoard,
			this.uiImagesBoard?.layerAbove.none,
			this.background,
			this.uiImagesBoard?.layerAbove.background,
			this.progressBar,
			this.uiImagesBoard?.layerAbove.hud,
			this.uiBgPatternBoard,
			this.uiImagesBoard?.layerAbove.bgPattern,
			this.fxBoard,
			this.uiImagesBoard?.layerAbove.fx,
			this.uiImagesBoard?.layerAbove.judgementLine,
			this.uiBgNotesBoard,
			this.uiImagesBoard?.layerAbove.bgNotes,
			this.doubleLinesBoard,
			this.uiNotesBoard,
			this.uiImagesBoard?.layerAbove.notes,
			this.uiNotesBoard?.circles,
			this.uiImagesBoard?.layerAbove.circles,
			this.tipPointsBoard,
			this.uiImagesBoard?.layerAbove.tipPoints,
			this.fxBoard.front,
			this.uiImagesBoard?.layerAbove.fxFront,
		]));
	}

	updateAudioAndHaptics() {
		this.seWithMusic?.update();
		this.vibrationWithMusic?.update();
	}

	// except fxBoard
	updateBoards(delta) {
		this.uiEffectsBoard?.update(delta);
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
		this.uiImagesBoard?.clear();
		this.uiEffectsBoard?.clear();
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
		this.uiEffectsBoard?.adjustProgress(time);
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
