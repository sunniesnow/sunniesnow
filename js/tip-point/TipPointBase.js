Sunniesnow.TipPointBase = class TipPointBase extends PIXI.Container {
	constructor(events) {
		super();
		this.events = events;
		this.checkpoints = events.map(event => {
			const checkpoint = {time: event.time};
			[checkpoint.x, checkpoint.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
			return checkpoint;
		});
		this.startTime = this.checkpoints[0].time;
		this.endTime = this.checkpoints[this.checkpoints.length - 1].time;
	}

	static initialize() {
	}

	update(time) {
	}
};
