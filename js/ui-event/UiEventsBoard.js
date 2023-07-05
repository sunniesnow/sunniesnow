Sunniesnow.UiEventsBoard = class UiEventsBoard extends PIXI.Container {

	constructor(events, fxBoard, debugBoard) {
		super();
		this.unappearedEvents = events.slice();
		this.uiEvents = [];
		this.fxBoard = fxBoard;
		this.debugBoard = debugBoard;
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
			const uiEvent = new event.constructor.UI_CLASS(event, this.fxBoard, this.debugBoard);
			this.addChild(uiEvent);
			this.uiEvents.push(uiEvent);
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
	}
};
