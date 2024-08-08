Sunniesnow.TipPointBase = class TipPointBase extends PIXI.Container {

	static ACTIVE_DURATION = 0;
	static ZOOMING_IN_DURATION = 0;
	static ZOOMING_OUT_DURATION = 0;
	static REMNANT_DURATION = 0;

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
		// ready -> active -> zoomingIn -> holding -> zoomingOut -> remnant -> finished
		this.state = 'ready';
		this.populate();
	}

	static async load() {
	}

	populate() {
	}

	update(time) {
		this.updateState(time);
		switch (this.state) {
			case 'active':
				this.updateActive(time);
				break;
			case 'zoomingIn':
				this.updateZoomingIn(time);
				break;
			case 'holding':
				this.updateHolding(time);
				break;
			case 'zoomingOut':
				this.updateZoomingOut(time);
				break;
			case 'remnant':
				this.updateRemnant(time);
				break;
		}
	}

	updateState(time) {
		const sinceStart = time - this.startTime;
		const sinceEnd = time - this.endTime;
		if (sinceStart < -this.constructor.ACTIVE_DURATION) {
			this.visible = false;
			this.state = 'ready';
		} else if (sinceStart < 0) {
			this.visible = true;
			this.state = 'active';
		} else if (sinceStart < this.constructor.ZOOMING_IN_DURATION) {
			this.visible = true;
			this.state = 'zoomingIn';
		} else if (sinceEnd > Math.max(this.constructor.REMNANT_DURATION, this.constructor.ZOOMING_OUT_DURATION)) {
			this.visible = false;
			this.state = 'finished';
		} else if (sinceEnd > this.constructor.ZOOMING_OUT_DURATION) {
			this.visible = true;
			this.state = 'remnant';
		} else if (sinceEnd > 0) {
			this.visible = true;
			this.state = 'zoomingOut';
		} else {
			this.visible = true;
			this.state = 'holding';
		}
	}

	updateActive(time) {
	}

	updateZoomingIn(time) {
	}

	updateHolding(time) {
	}

	updateZoomingOut(time) {
	}

	updateRemnant(time) {
	}

};
