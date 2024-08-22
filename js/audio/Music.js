Sunniesnow.Music = {
	async load() {
		const buffer = Sunniesnow.Loader.loaded.chart.music[Sunniesnow.game.settings.musicSelect];
		if (!buffer) {
			Sunniesnow.Logs.error('No music loaded');
		}
		this.audio = await Sunniesnow.Audio.fromArrayBuffer(
			buffer,
			Sunniesnow.game.settings.volumeMusic,
			Sunniesnow.game.settings.gameSpeed
		);
		this.duration = this.audio.duration;
		// this.start is set in Sunniesnow.Chart.load()
	},

	play(time) {
		this.lastResumeTime = time;
		this.lastResumeTimeStamp = performance.now();
		this.audio.play(time - this.delay());
		this.pausing = false;
	},

	playFromBeginning() {
		this.finished = false;
		this.play(this.start);
	},

	update() {
		if (!this.pausing) {
			this.updateCurrentTime();
		}
		this.progress = this.currentTime / this.audio.duration;
		if (this.progress >= 1) {
			this.finished = true;
		}
	},

	pause(time = null) {
		this.stop();
		if (time !== null) {
			this.seek(time);
		}
	},

	seek(time) {
		if (this.pausing) {
			this.lastResumeTime = this.lastPauseTime = this.currentTime = time;
		} else {
			this.play(time);
		}
	},

	resume() {
		if (!this.pausing) {
			return false;
		}
		const prep = Sunniesnow.game.level.finished ? 0 : Sunniesnow.game.settings.resumePreparationTime;
		this.play(Math.max(this.lastResumeTime, this.lastPauseTime - prep));
		return true;
	},

	togglePausing() {
		if (this.pausing) {
			this.resume();
		} else {
			this.pause();
		}
	},

	stop() {
		if (this.pausing) {
			return;
		}
		this.updateCurrentTime();
		this.lastPauseTime = this.currentTime;
		this.audio.stop();
		this.pausing = true;
	},

	updateCurrentTime() {
		this.currentTime = this.pausing ? this.lastPauseTime : this.audio.currentTime() + this.delay();
	},

	delay() {
		return Sunniesnow.game.settings.delay + Sunniesnow.Audio.systematicDelay();
	},

	convertTimeStamp(timeStamp) {
		/* The only places where this method is called are in TouchManager,
		when it wants to get the time of the touch events.
		The current implementation leads to a curious bug on most browsers:
		the time are wrong by an offset after a long pause.
		The modified implementation does not do exactly what it should do,
		but it fixes the bug. */
		// return (timeStamp - this.lastResumeTimeStamp) / 1000 + this.lastResumeTime;
		if (!this.pausing) {
			this.updateCurrentTime();
		}
		return this.currentTime;
	}
};
