Sunniesnow.VibrationWithMusic = class VibrationWithMusic {
	constructor() {
		this.clear(true);
	}

	initAllEvents() {
		this.allEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.Note);
		if (Sunniesnow.game.progressAdjustable) {
			// e.vibrationStartTime() instead of e.vibrationStartTime() - Sunniesnow.Config.UI_PREPARATION_TIME
			// reason similar to SeWithMusic
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.vibrationStartTime(), e => e.vibrationEndTime());
		}
	}

	clear(chartUpdate = false) {
		if (chartUpdate) {
			this.initAllEvents();
		}
		Sunniesnow.VibrationManager.clear();
		this.unhitEvents = this.allEvents.slice();
		this.holdingEvents = [];
	}

	update() {
		const time = Sunniesnow.Music.currentTime;
		while (this.unhitEvents.length > 0) {
			const event = this.unhitEvents[0];
			if (time < event.vibrationStartTime() - Sunniesnow.Config.UI_PREPARATION_TIME) {
				break;
			}
			this.holdingEvents.push(this.unhitEvents.shift());
			Sunniesnow.VibrationManager.vibrateOnce(event.vibrationTime(), event.vibrationStartTime() * 1000);
			Sunniesnow.VibrationManager.acquireHold(event, event.vibrationStartTime());
		}
		this.holdingEvents.sort((a, b) => a.vibrationEndTime() - b.vibrationEndTime());
		while (this.holdingEvents.length > 0) {
			const event = this.holdingEvents[0];
			if (time < event.vibrationEndTime() - Sunniesnow.Config.UI_PREPARATION_TIME) {
				break;
			}
			this.holdingEvents.shift();
			Sunniesnow.VibrationManager.releaseHold(event, event.vibrationEndTime());
		}
	}

	adjustProgress(time) {
		this.unhitEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.time - Sunniesnow.Config.UI_PREPARATION_TIME - time)
		);
		this.holdingEvents = this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.slice();
		this.holdingEvents.forEach(event => Sunniesnow.VibrationManager.acquireHold(event, event.vibrationStartTime()));
	}
};
