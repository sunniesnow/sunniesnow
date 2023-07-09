Sunniesnow.Music = {
	async load() {
		const buffer = Sunniesnow.Loader.loaded.chart.music[Sunniesnow.game.settings.musicSelect];
		this.audio = await Sunniesnow.Audio.fromArrayBuffer(
			buffer,
			Sunniesnow.game.settings.volumeMusic,
			Sunniesnow.game.settings.gameSpeed
		);
		this.audio.addFinishListener(() => this.finished = true);
	},

	play(time) {
		this.lastResumeTime = time;
		this.lastResumeTimeStamp = performance.now();
		this.audio.play(time - this.delay());
		this.pausing = false;
	},

	playFromBeginning() {
		const start = Math.min(0, Sunniesnow.game.chart.events[0].appearTime());
		this.finished = false;
		this.play(start - Sunniesnow.Config.preperationTime);
	},

	update() {
		if (!this.pausing) {
			this.updateCurrentTime();
		}
		this.progress = this.currentTime / this.audio.duration;
	},

	pause() {
		if (this.pausing) {
			return false;
		}
		this.stop();
		return true;
	},

	resume() {
		if (!this.pausing) {
			return false;
		}
		this.play(Math.max(this.lastResumeTime, this.currentTime - Sunniesnow.Config.resumePreperationTime));
		return true;
	},

	stop() {
		this.updateCurrentTime();
		this.audio.stop();
		this.pausing = true;
	},

	updateCurrentTime() {
		this.currentTime = this.audio.currentTime() + this.delay();
	},

	delay() {
		return Sunniesnow.game.settings.delay + Sunniesnow.Audio.systematicDelay();
	},

	convertTimeStamp(timeStamp) {
		return (timeStamp - this.lastResumeTimeStamp) / 1000 + this.lastResumeTime;
	}
};
