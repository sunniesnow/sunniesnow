Sunniesnow.VibrationManager = {

	keyTimes: [],
	holdingStart: new Map(),
	holdingEnd: new Map(),

	start() {
		this.clear();
		if (Sunniesnow.game.settings.holdVibrationPeriod > 0) {
			this.intervalId = setInterval(() => this.update(), Sunniesnow.game.settings.holdVibrationPeriod);
		}
	},

	clear() {
		navigator.vibrate(0);
		this.keyTimes.length = 0;
		this.holdingStart.clear();
		this.holdingEnd.clear();
	},

	terminate() {
		clearInterval(this.intervalId);
		this.intervalId = null;
		this.clear();
	},

	update() {
		if (Sunniesnow.Music.pausing) {
			this.keyTimes.length = 0;
			return;
		}
		this.updateCurrentTime();
		this.updateHolds();
		this.reschedule();
	},

	updateHolds() {
		this.holdingEnd.forEach((time, object) => {
			if (time <= this.currentTime) {
				this.holdingEnd.delete(object);
				this.holdingStart.delete(object);
			}
		});
		if (this.holdingStart.size > 0) {
			this.vibrateOnce(Sunniesnow.game.settings.holdVibrationPeriod * Sunniesnow.game.settings.holdVibrationDutyCycle);
		}
	},

	updateCurrentTime() {
		Sunniesnow.Music.updateCurrentTime(); // This may get called during main loop update. Potential bugs?
		this.currentTime = Sunniesnow.Music.currentTime * 1000;
	},

	vibrateOnce(duration, time) {
		this.updateCurrentTime();
		time ??= this.currentTime;
		if (this.currentTime > time) {
			duration -= this.currentTime - time;
			time = this.currentTime;
		}
		this.addKeyTimes(time, time + duration);
		this.reschedule();
	},

	addKeyTimes(start, end) {
		if (start >= end) {
			return;
		}
		const startIndex = Sunniesnow.Utils.bisectLeft(this.keyTimes, start);
		const endIndex = Sunniesnow.Utils.bisectRight(this.keyTimes, end);
		this.keyTimes.splice(
			startIndex,
			endIndex - startIndex + 1,
			...[startIndex%2===0 && start, endIndex%2===1 && end].filter(e => e!==false)
		);
	},

	reschedule() {
		const currentIndex = Sunniesnow.Utils.bisectRight(this.keyTimes, this.currentTime);
		this.keyTimes.splice(0, currentIndex+1, this.currentTime, ...(currentIndex%2===0 ? [] : [this.currentTime]));
		navigator.vibrate(Sunniesnow.Utils.arrayDifference(this.keyTimes));
	},

	acquireHold(object, time) {
		time ??= (this.updateCurrentTime(), this.currentTime);
		this.holdingStart.set(object, time);
	},

	releaseHold(object, time) {
		time ??= (this.updateCurrentTime(), this.currentTime);
		if (!this.holdingStart.has(object)) {
			return;
		}
		this.holdingEnd.set(object, time);
	}
};
