Sunniesnow.SceneGame = class SceneGame extends Sunniesnow.Scene {
	start() {
		super.start();
		this.started = false; // set to true when the music starts playing
		Sunniesnow.game.level = new Sunniesnow.Level();
		this.populateUi();
		this.populateBoards();
		this.loadMusic();
	}

	populateUi() {
		this.background = new Sunniesnow.Background();
		this.topLeftHud = new Sunniesnow.TopLeftHud();
		this.topRightHud = new Sunniesnow.TopRightHud();
		this.topCenterHud = new Sunniesnow.TopCenterHud();
		this.progressBar = new Sunniesnow.ProgressBar();
		this.addChild(this.background);
		this.addChild(this.topLeftHud);
		this.addChild(this.topRightHud);
		this.addChild(this.topCenterHud);
		this.addChild(this.progressBar);
		if (Sunniesnow.game.settings.debug) {
			this.debugHud = new Sunniesnow.DebugHud();
			this.addChild(this.debugHud);
		}
	}

	populateBoards() {
		this.fxBoard = new Sunniesnow.FxBoard();
		this.uiEventsBoard = new Sunniesnow.UiEventsBoard(Sunniesnow.game.chart.events, this.fxBoard);
		this.tipPointsBoard = new Sunniesnow.TipPointsBoard(Sunniesnow.game.chart.events);
		this.addChild(this.fxBoard);
		this.addChild(this.uiEventsBoard);
		this.addChild(this.tipPointsBoard);
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
		if (this.started && !this.pausing) {
			this.currentTime = this.music.currentTime();
			Sunniesnow.game.level.update(this.currentTime)
			this.uiEventsBoard.update(this.currentTime);
			this.fxBoard.update(delta);
			this.tipPointsBoard.update(this.currentTime);
		}
		if (this.debugHud) {
			this.debugHud.update(delta, {
				FPS: Sunniesnow.game.app.ticker.FPS,
				'Current  time': this.currentTime
			});
		}
	}

	pause() {
		this.currentTime = this.music.currentTime();
		this.music.stop();
		this.pausing = true;
	}

	resume() {
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
};
