Sunniesnow.TipPointsBoard = class TipPointsBoard extends PIXI.Container {
	constructor() {
		super();
		this.clear();
	}

	clear() {
		this.events = Sunniesnow.game.chart.events.filter(event => event.tipPoint !== null && event.tipPoint !== undefined);
		this.unappearedTipPointHeads = new Map();
		for (const event of Sunniesnow.game.chart.events) {
			if (event.tipPoint === null || event.tipPoint === undefined) {
				continue;
			}
			if (this.unappearedTipPointHeads.has(event.tipPoint)) {
				this.unappearedTipPointHeads.get(event.tipPoint).push(event);
			} else {
				this.unappearedTipPointHeads.set(event.tipPoint, [event]);
			}
		}
		this.unappearedTipPointHeads = Array.from(this.unappearedTipPointHeads);
		this.tipPoints ||= {};
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			tipPoint.destroy({children: true});
			this.removeChild(tipPoint);
			delete this.tipPoints[id];
		}
	}

	addNewTipPoints(time) {
		while (this.unappearedTipPointHeads.length > 0 && time >= this.unappearedTipPointHeads[0][1][0].time - Sunniesnow.Config.uiPreparationTime) {
			this.add(...this.unappearedTipPointHeads.shift());
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
}
