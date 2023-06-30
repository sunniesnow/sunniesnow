Sunniesnow.TipPointsBoard = class TipPointsBoard extends PIXI.Container {
	constructor(events) {
		super();
		this.events = events.filter(event => event.tipPoint !== null);
		this.events.sort((a, b) => a.time - b.time);
		this.tipPoints = {};
	}

	addNewTipPoints(time) {
		if (this.events.length === 0) {
			return;
		}
		const preperation = Sunniesnow.Config.preperationTime * Sunniesnow.game.settings.gameSpeed;
		if (time < this.events[0].time - preperation) {
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

	update(time) {
		this.addNewTipPoints(time);
		for (const id in this.tipPoints) {
			const tipPoint = this.tipPoints[id];
			if (time >= tipPoint.endTime) {
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
