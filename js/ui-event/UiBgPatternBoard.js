Sunniesnow.UiBgPatternBoard = class UiBgPatternBoard extends PIXI.Container {

	constructor(events) {
		super();
		this.unappearedEvents = events.filter(event => event instanceof Sunniesnow.BgPattern)
		this.uiEvents = [];
	}

	update(time) {
		const preperation = Sunniesnow.Config.preperationTime * Sunniesnow.game.settings.gameSpeed;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			const shouldStartTime = event.appearTime() - preperation;
			if (time < shouldStartTime) {
				break;
			}
			this.unappearedEvents.shift();
			this.uiEvents.push(new event.constructor.UI_CLASS(event));
		}
		for (const uiEvent of this.uiEvents) {
			const relativeTime = (time - uiEvent.event.time) / Sunniesnow.game.settings.gameSpeed;
			uiEvent.update(relativeTime);
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
