Sunniesnow.SeWithMusic = class SeWithMusic {
	constructor() {
		this.clear();
	}

	clear() {
		SeTap.stop();
		SeFlick.stop();
		SeHold.stop();
		SeDrag.stop();
		this.unhitEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.Note);
		this.holdingEvents = [];
	}

	update() {
		const time = Sunniesnow.Music.currentTime - Sunniesnow.Music.delay();
		const preperation = Sunniesnow.Config.uiPreperationTime * Sunniesnow.game.settings.gameSpeed;
		while (this.unhitEvents.length > 0) {
			const event = this.unhitEvents[0];
			if (time < event.time - preperation) {
				break;
			}
			this.holdingEvents.push(this.unhitEvents.shift());
			this.holdingEvents.sort((a, b) => a.endTime() - b.endTime());
			event.hitSe((event.time - time) / Sunniesnow.game.settings.gameSpeed);
		}
		while (this.holdingEvents.length > 0) {
			const event = this.holdingEvents[0];
			if (time < event.endTime()) {
				break;
			}
			this.holdingEvents.shift();
			event.releaseSe((event.endTime() - time) / Sunniesnow.game.settings.gameSpeed);
		}
	}
};
