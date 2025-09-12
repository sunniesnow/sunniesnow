Sunniesnow.UiImagesBoard = class UiImagesBoard {

	constructor() {
		this.clear(true);
		this.layerAbove = {};
		for (const above of Sunniesnow.Image.LAYER_ABOVE) {
			this.layerAbove[above] = new PIXI.Container();
			this.layerAbove[above].label = `images-board-layer-above-${Sunniesnow.Utils.camelToSlug(above)}`;
			this.layerAbove[above].sortableChildren = true;
		}
	}

	initAllEvents() {
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.Image);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME, e => e.disappearTime());
		}
	}

	clear(chartUpdate = false) {
		if (chartUpdate) {
			this.initAllEvents();
		}
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
			this.add(this.unappearedEvents.shift());
		}
		Sunniesnow.Utils.eachWithRedoingIf(this.uiEvents, (uiEvent, i) => {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({children: true});
				this.uiEvents.splice(i, 1);
				return true;
			}
		});
	}

	add(event) {
		const uiEvent = event.newUiEvent();
		this.uiEvents.push(uiEvent);
		this.layerAbove[event.above].addChild(uiEvent);
	}

	adjustProgress(time) {
		this.unappearedEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME - time)
		);
		this.removeAll();
		this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.forEach(event => this.add(event));
	}

};
