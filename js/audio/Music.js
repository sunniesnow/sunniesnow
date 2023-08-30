Sunniesnow.Music = {
	async load() {
		const buffer = Sunniesnow.Loader.loaded.chart.music[Sunniesnow.game.settings.musicSelect];
		if (!buffer) {
			Sunniesnow.Utils.error('No music loaded');
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
		const prep = Sunniesnow.game.level.finished ? 0 : Sunniesnow.game.settings.resumePreparationTime;
		this.play(Math.max(this.lastResumeTime, this.currentTime - prep));
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
