Sunniesnow.SeWithMusic = class SeWithMusic {
	constructor() {
		this.allEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.Note);
		if (Sunniesnow.game.progressAdjustable) {
			// e.time instead of e.time - Sunniesnow.Config.UI_PREPARATION_TIME
			// because we want update() to handle hitSe() correctly.
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.time, e => e.endTime());
		}
		this.clear();
	}

	clear() {
		Sunniesnow.SeTap.stop();
		Sunniesnow.SeFlick.stop();
		Sunniesnow.SeHold.stop();
		Sunniesnow.SeDrag.stop();
		this.unhitEvents = this.allEvents.slice();
		this.holdingEvents = [];
	}

	update() {
		const time = Sunniesnow.Music.currentTime - Sunniesnow.Music.delay();
		while (this.unhitEvents.length > 0) {
			const event = this.unhitEvents[0];
			if (time < event.time - Sunniesnow.Config.UI_PREPARATION_TIME) {
				break;
			}
			this.holdingEvents.push(this.unhitEvents.shift());
			event.hitSe(event.time - time);
		}
		this.holdingEvents.sort((a, b) => a.endTime() - b.endTime());
		while (this.holdingEvents.length > 0) {
			const event = this.holdingEvents[0];
			if (time < event.endTime() - Sunniesnow.Config.UI_PREPARATION_TIME) {
				break;
			}
			this.holdingEvents.shift();
			event.releaseSe(event.endTime() - time);
		}
	}

	adjustProgress(time) {
		time -= Sunniesnow.Music.delay();
		this.unhitEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.time - Sunniesnow.Config.UI_PREPARATION_TIME - time)
		);
		this.holdingEvents = this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.slice();
	}
};
