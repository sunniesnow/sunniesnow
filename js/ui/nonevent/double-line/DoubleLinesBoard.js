Sunniesnow.DoubleLinesBoard = class DoubleLinesBoard extends PIXI.Container {

	static globalId = 0;

	constructor() {
		super();
		this.label = 'double-lines-board';
		this.clear(true);
	}

	initAllEvents() {
		this.allEvents = Sunniesnow.game.chart.events.filter(event => {
			if (!(event instanceof Sunniesnow.Note)) {
				return false;
			}
			if (!Sunniesnow.game.settings.doubleLineTap && event instanceof Sunniesnow.Tap) {
				return false;
			}
			if (!Sunniesnow.game.settings.doubleLineHold && event instanceof Sunniesnow.Hold) {
				return false;
			}
			if (!Sunniesnow.game.settings.doubleLineDrag && event instanceof Sunniesnow.Drag) {
				return false;
			}
			if (!Sunniesnow.game.settings.doubleLineFlick && event instanceof Sunniesnow.Flick) {
				return false;
			}
			if (!Sunniesnow.game.settings.doubleLineDragFlick && event instanceof Sunniesnow.DragFlick) {
				return false;
			}
			return !!event.getConnectedNote();
		});
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(
				this.allEvents,
				e => e.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME,
				e => e.endTime() + Sunniesnow.DoubleLine.FADING_OUT_DURATION
			);
		}
		this.clear();
	}

	clear(chartUpdate = false) {
		if (chartUpdate) {
			this.initAllEvents();
		}
		this.unappearedEvents = this.allEvents.slice();
		this.removeAll();
	}

	removeAll() {
		while (this.children.length > 0) {
			this.children[0].destroy({children: true});
		}
	}

	add(doubleLine) {
		this.addChild(doubleLine);
	}

	addNewDoubleLines(time) {
		// this condition breaks if DoubleLine.FADING_IN_DURATION is larger than FADING_IN_DURATION of note plus Sunniesnow.Config.UI_PREPARATION_TIME
		while (this.unappearedEvents.length > 0 && time >= this.unappearedEvents[0].appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME) {
			const event = this.unappearedEvents.shift();
			this.add(new Sunniesnow.DoubleLine(event, event.getConnectedNote()));
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		this.addNewDoubleLines(time);
		Sunniesnow.Utils.eachWithRedoingIf(this.children, child => {
			child.update(time - child.event1.time);
			child.alpha = child.fadingAlpha;
			if (child.state === 'finished') {
				child.destroy({children: true});
				return true;
			}
		});
	}

	adjustProgress(time) {
		this.unappearedEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME - time)
		);
		this.removeAll();
		const currentEvents = this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events;
		for (const event of currentEvents) {
			this.add(new Sunniesnow.DoubleLine(event, event.getConnectedNote()));
		}
	}

};
