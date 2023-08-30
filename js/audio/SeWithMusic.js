Sunniesnow.SeWithMusic = class SeWithMusic {
	constructor() {
		this.clear();
	}

	clear() {
		Sunniesnow.SeTap.stop();
		Sunniesnow.SeFlick.stop();
		Sunniesnow.SeHold.stop();
		Sunniesnow.SeDrag.stop();
		this.unhitEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.Note);
		this.holdingEvents = [];
	}

	update() {
		const time = Sunniesnow.Music.currentTime - Sunniesnow.Music.delay();
		while (this.unhitEvents.length > 0) {
			const event = this.unhitEvents[0];
			if (time < event.time - Sunniesnow.Config.uiPreparationTime) {
				break;
			}
			this.holdingEvents.push(this.unhitEvents.shift());
			this.holdingEvents.sort((a, b) => a.endTime() - b.endTime());
			event.hitSe(event.time - time);
		}
		while (this.holdingEvents.length > 0) {
			const event = this.holdingEvents[0];
			if (time < event.endTime() - Sunniesnow.Config.uiPreparationTime) {
				break;
			}
			this.holdingEvents.shift();
			event.releaseSe(event.endTime() - time);
		}
	}
};
