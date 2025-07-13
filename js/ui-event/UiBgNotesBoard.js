Sunniesnow.UiBgNotesBoard = class UiBgNotesBoard extends PIXI.Container {
	constructor() {
		super();
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.BgNote);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(
				this.allEvents,
				e => e.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME,
				e => e.disappearTime()
			);
		}
		this.clear();
	}

	clear() {
		this.unappearedEvents = this.allEvents.slice();
		this.uiEvents ??= [];
		this.removeAll();
	}

	removeAll() {
		while (this.uiEvents.length > 0) {
			this.uiEvents.shift().destroy({children: true});
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			const shouldStartTime = event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME;
			if (time < shouldStartTime) {
				break;
			}
			this.unappearedEvents.shift();
			const uiEvent = event.newUiEvent();
			Sunniesnow.game.settings.reverseNoteOrder ? this.addChildAt(uiEvent, 0) : this.addChild(uiEvent);
			this.uiEvents.push(uiEvent);
		}
		Sunniesnow.Utils.eachWithRedoingIf(this.uiEvents, (uiEvent, i) => {
			uiEvent.update(time - uiEvent.event.time);
			uiEvent.alpha = uiEvent.fadingAlpha;
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({children: true});
				this.uiEvents.splice(i, 1);
				return true;
			}
		});
	}

	adjustProgress(time) {
		this.unappearedEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME - time)
		);
		this.removeAll();
		let currentEvents = this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events;
		currentEvents = Sunniesnow.game.settings.reverseNoteOrder ? currentEvents.reverse() : currentEvents.slice();
		this.uiEvents = currentEvents.map(event => event.newUiEvent());
		this.uiEvents.forEach(uiEvent => this.addChild(uiEvent));
	}
};
