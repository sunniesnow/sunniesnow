Sunniesnow.UiNotesBoard = class UiNotesBoard extends PIXI.Container {

	constructor() {
		super();
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.Note);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME, e => e.disappearTime());
		}
		this.clear();
		if (!Sunniesnow.game.settings.hideCircles) {
			this.circles = new PIXI.Container();
		}
	}

	clear() {
		this.unappearedEvents = this.allEvents.slice();
		this.uiEvents ??= [];
		this.removeAll();
	}

	removeAll() {
		while (this.uiEvents.length > 0) {
			this.remove(this.uiEvents[0]);
		}
	}

	add(event) {
		const uiEvent = event.newUiEvent();
		if (!Sunniesnow.game.settings.hideNotes) {
			Sunniesnow.game.settings.reverseNoteOrder ? this.addChildAt(uiEvent, 0) : this.addChild(uiEvent);
		}
		if (!Sunniesnow.game.settings.hideCircles && uiEvent.circle) {
			Sunniesnow.game.settings.reverseNoteOrder ? this.circles.addChildAt(uiEvent.circle, 0) : this.circles.addChild(uiEvent.circle);
		}
		this.uiEvents.push(uiEvent);
	}

	remove(uiEvent) {
		uiEvent.circle?.destroy({children: true});
		uiEvent.destroy({children: true});
		this.uiEvents.splice(this.uiEvents.indexOf(uiEvent), 1);
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
			this.add(event);
		}
		Sunniesnow.Utils.eachWithRedoingIf(this.uiEvents, uiEvent => {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				this.remove(uiEvent);
				return true;
			}
		});
	}

	adjustProgress(time) {
		this.unappearedEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME - time)
		);
		this.removeAll();
		this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.forEach(event => this.add(event));
	}
};
