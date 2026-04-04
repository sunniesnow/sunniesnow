Sunniesnow.TipPointsBoard = class TipPointsBoard extends PIXI.Container {
	constructor() {
		super();
		this.label = 'tip-points-board';
		this.clear(true);
	}

	initAllEvents() {
		this.allTipPoints = Sunniesnow.game.chart.tipPoints;
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(
				this.allTipPoints, e => e.appearTime, e => e.disappearTime
			);
		}
	}

	clear(chartUpdate = false) {
		if (chartUpdate) {
			this.initAllEvents();
		}
		this.unappearedTipPoints = this.allTipPoints.slice();
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
		while (this.unappearedTipPoints.length > 0 && time >= this.unappearedTipPoints[0].appearTime) {
			const {id, events, effects} = this.unappearedTipPoints.shift();
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
		this.unappearedTipPoints = this.allTipPoints.slice(
			Sunniesnow.Utils.bisectLeft(this.allTipPoints, e => e.appearTime - time)
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
