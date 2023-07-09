Sunniesnow.TipPointsBoard = class TipPointsBoard extends PIXI.Container {
	constructor() {
		super();
		this.clear();
	}

	clear() {
		this.events = Sunniesnow.game.chart.events.filter(event => event.tipPoint !== null && event.tipPoint !== undefined);
		this.tipPoints ||= {};
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			tipPoint.destroy({ children: true });
			this.removeChild(tipPoint);
			delete this.tipPoints[id];
		}
	}

	addNewTipPoints(time) {
		if (this.events.length === 0) {
			return;
		}
		if (time < this.events[0].time - Sunniesnow.Config.uiPreperationTime) {
			return;
		}
		const events = [this.events.shift()];
		const tipPoint = events[0].tipPoint;
		for (let i = 0; i < this.events.length;) {
			const event = this.events[i];
			if (event.tipPoint === tipPoint) {
				events.push(event);
				this.events.splice(i, 1);
			} else {
				i++;
			}
		}
		this.add(tipPoint, events);
		this.addNewTipPoints(time);
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
