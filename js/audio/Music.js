Sunniesnow.Music = {
	async load() {
		return new Promise((resolve, reject) => {
			const buffer = Sunniesnow.Loader.loaded.chart.music[Sunniesnow.game.settings.musicSelect];
			this.music = new Sunniesnow.Audio(buffer)
			this.music.playbackRate = Sunniesnow.game.settings.gameSpeed;
			this.music.volume = Sunniesnow.game.settings.volumeMusic;
			this.music.addLoadListener(() => resolve());
			this.music.addFinishListener(() => this.finished = true);
		});
	},

	playFromBeginning() {
		const start = Math.min(0, Sunniesnow.game.chart.events[0].appearTime());
		const preperation = Sunniesnow.Config.preperationTime * Sunniesnow.game.settings.gameSpeed;
		this.music.play(start - preperation - Sunniesnow.game.settings.delay / 1000);
		this.pausing = false;
		this.finished = false;
	},

	update() {
		this.currentTime = this.getCurrentTime();
		this.progress = this.currentTime / this.music.duration;
	},

	pause() {
		if (this.pausing || this.finished) {
			return false;
		}
		this.currentTime = this.music.currentTime();
		this.music.stop();
		this.pausing = true;
		return true;
	},

	resume() {
		if (!this.pausing || this.finished) {
			return false;
		}
		this.music.play(this.currentTime - Sunniesnow.Config.resumePreperationTime);
		this.pausing = false;
		return true;
	},

	getCurrentTime() {
		if (!this.pausing) {
			return this.music.currentTime();
		}
		if (this.finished) {
			return this.music.duration;
		}
		return this.currentTime;
	}
};
