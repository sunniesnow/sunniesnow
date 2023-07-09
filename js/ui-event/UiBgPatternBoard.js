Sunniesnow.UiBgPatternBoard = class UiBgPatternBoard extends PIXI.Container {

	constructor() {
		super();
		this.clear();
	}

	clear() {
		this.unappearedEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.BgPattern)
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
			this.uiEvents.push(new event.constructor.UI_CLASS(event));
		}
		for (const uiEvent of this.uiEvents) {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({ children: true });
				this.removeChild(uiEvent);
				this.uiEvents.splice(this.uiEvents.indexOf(uiEvent), 1);
			}
		}
		// only one bg pattern is allowed to be displayed at the same time
		const index = this.uiEvents.findLastIndex(uiEvent => uiEvent.state !== 'ready');
		if (index > 0) {
			this.addChild(this.uiEvents[index]);
			const deprecated = this.uiEvents.splice(0, index);
			for (const uiEvent of deprecated) {
				uiEvent.destroy({ children: true });
				this.removeChild(uiEvent);
			}
		} else if (index === 0 && this.children.indexOf(this.uiEvents[0]) === -1) {
			this.addChild(this.uiEvents[index]);
		}
	}

};
