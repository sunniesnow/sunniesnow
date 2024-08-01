Sunniesnow.UiNotesBoard = class UiNotesBoard extends PIXI.Container {

	constructor(fxBoard) {
		super();
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.Note);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.appearTime() - Sunniesnow.Config.uiPreparationTime, e => e.disappearTime());
		}
		this.clear();
		this.fxBoard = fxBoard;
	}

	clear() {
		this.unappearedEvents = this.allEvents.slice();
		this.uiEvents ||= [];
		this.removeAll();
	}

	removeAll() {
		while (this.uiEvents.length > 0) {
			const uiEvent = this.uiEvents.shift();
			uiEvent.destroy({children: true});
			this.removeChild(uiEvent);
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			const shouldStartTime = event.appearTime() - Sunniesnow.Config.uiPreparationTime;
			if (time < shouldStartTime) {
				break;
			}
			this.unappearedEvents.shift();
			const uiEvent = event.newUiEvent(this.fxBoard);
			Sunniesnow.game.settings.reverseNoteOrder ? this.addChildAt(uiEvent, 0) : this.addChild(uiEvent);
			this.uiEvents.push(uiEvent);
		}
		for (const uiEvent of this.uiEvents) {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({children: true});
				this.removeChild(uiEvent);
				this.uiEvents.splice(this.uiEvents.indexOf(uiEvent), 1);
			}
		}
	}

	adjustProgress(time) {
		this.unappearedEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - Sunniesnow.Config.uiPreparationTime - time)
		);
		this.removeAll();
		let currentEvents = this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events;
		currentEvents = Sunniesnow.game.settings.reverseNoteOrder ? currentEvents.reverse() : currentEvents.slice();
		this.uiEvents = currentEvents.map(event => event.newUiEvent(this.fxBoard));
		this.uiEvents.forEach(uiEvent => this.addChild(uiEvent));
	}
};
