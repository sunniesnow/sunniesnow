Sunniesnow.UiBgNotesBoard = class UiBgNotesBoard extends PIXI.Container {
	constructor() {
		super();
		this.clear();
	}

	clear() {
		this.unappearedEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.BgNote);
		this.unappearedEvents.sort((a, b) => a.appearTime() - b.appearTime());
		this.uiEvents ||= [];
		while (this.uiEvents.length > 0) {
			const uiEvent = this.uiEvents.shift();
			uiEvent.destroy({ children: true });
			this.removeChild(uiEvent);
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			const shouldStartTime = event.appearTime() - Sunniesnow.Config.uiPreperationTime;
			if (time < shouldStartTime) {
				break;
			}
			this.unappearedEvents.shift();
			const uiEvent = new event.constructor.UI_CLASS(event);
			this.addChild(uiEvent);
			this.uiEvents.push(uiEvent);
		}
		for (const uiEvent of this.uiEvents) {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({ children: true });
				this.removeChild(uiEvent);
				this.uiEvents.splice(this.uiEvents.indexOf(uiEvent), 1);
			}
		}
	}
};
