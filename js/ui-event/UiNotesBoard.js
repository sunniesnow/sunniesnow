Sunniesnow.UiNotesBoard = class UiNotesBoard extends PIXI.Container {

	constructor() {
		super();
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.Note);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME, e => e.disappearTime());
		}
		this.clear();
	}

	clear() {
		this.unappearedEvents = this.allEvents.slice();
		this.uiEvents ||= [];
		this.removeAll();
	}

	removeAll() {
		while (this.uiEvents.length > 0) {
			this.remove(this.uiEvents[0]);
		}
	}

	add(event) {
		const container = new PIXI.Container();
		const uiEvent = event.newUiEvent();
		uiEvent.circle?.addTo(container);
		if (!Sunniesnow.game.settings.hideNotes) {
			uiEvent.addTo(container);
		}
		Sunniesnow.game.settings.reverseNoteOrder ? this.addChildAt(container, 0) : this.addChild(container);
		this.uiEvents.push({uiEvent, container});
	}

	remove(obj) {
		const {container} = obj;
		container.destroy({children: true});
		this.removeChild(container);
		this.uiEvents.splice(this.uiEvents.indexOf(obj), 1);
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
		Sunniesnow.Utils.eachWithRedoingIf(this.uiEvents, obj => {
			const {uiEvent, container} = obj;
			uiEvent.update(time - uiEvent.event.time);
			container.alpha = uiEvent.fadingAlpha;
			if (uiEvent.state === 'finished') {
				this.remove(obj);
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
