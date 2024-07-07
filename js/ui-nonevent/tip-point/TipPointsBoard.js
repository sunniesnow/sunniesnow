Sunniesnow.TipPointsBoard = class TipPointsBoard extends PIXI.Container {
	constructor() {
		super();
		// [{id, events}, ...], sorted by events[0].time
		this.allTipPointHeads = new Map();
		for (const event of Sunniesnow.game.chart.events) {
			if (event.tipPoint === null || event.tipPoint === undefined) {
				continue;
			}
			if (this.allTipPointHeads.has(event.tipPoint)) {
				this.allTipPointHeads.get(event.tipPoint).push(event);
			} else {
				this.allTipPointHeads.set(event.tipPoint, [event]);
			}
		}
		this.allTipPointHeads = Array.from(this.allTipPointHeads.entries().map(([id, events]) => ({id, events})));
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(
				this.allTipPointHeads,
				e => e.events[0].time - Sunniesnow.Config.uiPreparationTime,
				e => e.events[e.events.length - 1].time + Sunniesnow.TipPoint.ZOOMING_OUT_DURATION
			);
		}
		this.clear();
	}

	clear() {
		this.unappearedTipPointHeads = this.allTipPointHeads.slice();
		this.tipPoints ||= {};
		this.removeAll();
	}

	removeAll() {
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			tipPoint.destroy({children: true});
			this.removeChild(tipPoint);
			delete this.tipPoints[id];
		}
	}

	addNewTipPoints(time) {
		while (this.unappearedTipPointHeads.length > 0 && time >= this.unappearedTipPointHeads[0].events[0].time - Sunniesnow.Config.uiPreparationTime) {
			const {id, events} = this.unappearedTipPointHeads.shift();
			this.add(id, events);
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		this.addNewTipPoints(time);
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			if (tipPoint.state === 'finished') {
				this.removeChild(tipPoint);
				tipPoint.destroy({children: true});
				delete this.tipPoints[id];
			} else {
				tipPoint.update(time);
			}
		}
	}

	add(id, events) {
		this.tipPoints[id] = new Sunniesnow.TipPoint(events);
		this.addChild(this.tipPoints[id]);
	}

	adjustProgress(time) {
		this.unappearedTipPointHeads = this.allTipPointHeads.slice(
			Sunniesnow.Utils.bisectLeft(this.allTipPointHeads, e => e.events[0].time - Sunniesnow.Config.uiPreparationTime - time)
		);
		this.removeAll();
		this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.forEach(
			({id, events}) => this.add(id, events)
		);
	}
}
