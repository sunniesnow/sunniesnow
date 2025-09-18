Sunniesnow.TipPointsBoard = class TipPointsBoard extends PIXI.Container {
	constructor() {
		super();
		this.label = 'tip-points-board';
		this.clear(true);
	}

	initAllEvents() {
		// [{id, events, appearTime, disappearTime, effects}, ...], sorted by events[0].time
		this.allTipPointHeads = new Map();
		for (const event of Sunniesnow.game.chart.events) {
			if (event.tipPoint == null) {
				continue;
			}
			if (!this.allTipPointHeads.has(event.tipPoint)) {
				this.allTipPointHeads.set(event.tipPoint, {effects: [], events: []});
			}
			this.allTipPointHeads.get(event.tipPoint)[event instanceof Sunniesnow.EffectTipPoint ? 'effects' : 'events'].push(event);
		}
		// First convert to array then map instead of the other way around
		// because Safari and Firefox do not support Iterator.
		this.allTipPointHeads = Array.from(this.allTipPointHeads.entries()).map(
			([id, {events, effects}]) => ({
				id, events, effects,
				appearTime: events[0].time - Sunniesnow.TipPoint.ACTIVE_DURATION - Sunniesnow.Config.UI_PREPARATION_TIME,
				disappearTime: events[events.length - 1].time + Sunniesnow.TipPoint.ZOOMING_OUT_DURATION
			})
		);
		Sunniesnow.Utils.eachWithRedoingIf(
			this.allTipPointHeads,
			({events}, i) => events.length === 0 && this.allTipPointHeads.splice(i, 1)
		);
		this.allTipPointHeads.sort((a, b) => a.appearTime - b.appearTime);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(
				this.allTipPointHeads, e => e.appearTime, e => e.disappearTime
			);
		}
	}

	clear(chartUpdate = false) {
		if (chartUpdate) {
			this.initAllEvents();
		}
		this.unappearedTipPointHeads = this.allTipPointHeads.slice();
		this.tipPoints ??= {};
		this.removeAll();
	}

	removeAll() {
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			tipPoint.destroy({children: true});
			delete this.tipPoints[id];
		}
	}

	addNewTipPoints(time) {
		while (this.unappearedTipPointHeads.length > 0 && time >= this.unappearedTipPointHeads[0].appearTime) {
			const {id, events, effects} = this.unappearedTipPointHeads.shift();
			this.add(id, events, effects);
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		this.addNewTipPoints(time);
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			if (tipPoint.state === 'finished') {
				tipPoint.destroy({children: true});
				delete this.tipPoints[id];
			} else {
				tipPoint.update(time);
			}
		}
	}

	add(id, events, effects) {
		this.tipPoints[id] = new Sunniesnow.TipPoint(events, effects);
		this.addChild(this.tipPoints[id]);
	}

	adjustProgress(time) {
		this.unappearedTipPointHeads = this.allTipPointHeads.slice(
			Sunniesnow.Utils.bisectLeft(this.allTipPointHeads, e => e.appearTime - time)
		);
		this.removeAll();
		this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.forEach(
			({id, events, effects}) => this.add(id, events, effects)
		);
		for (const id in this.tipPoints) {
			this.tipPoints[id].adjustProgress(time);
		}
	}
}
