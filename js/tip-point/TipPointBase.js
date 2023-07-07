Sunniesnow.TipPointBase = class TipPointBase extends PIXI.Container {

	static ZOOMING_IN_DURATION = 0;
	static ZOOMING_OUT_DURATION = 0;

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
		// ready -> zoomingIn -> holding -> zoomingOut -> finished
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
			case 'zoomingIn':
				this.updateZoomingIn(time);
				break;
			case 'holding':
				this.updateHolding(time);
				break;
			case 'zoomingOut':
				this.updateZoomingOut(time);
				break;
		}
	}

	updateState(time) {
		const sinceStart = (time - this.startTime) / Sunniesnow.game.settings.gameSpeed;
		const sinceEnd = (time - this.endTime) / Sunniesnow.game.settings.gameSpeed;
		if (sinceStart < 0) {
			this.visible = false;
			this.state = 'ready';
		} else if (sinceStart < this.constructor.ZOOMING_IN_DURATION) {
			this.visible = true;
			this.state = 'zoomingIn';
		} else if (sinceEnd > this.constructor.ZOOMING_OUT_DURATION) {
			this.visible = false;
			this.state = 'finished';
		} else if (sinceEnd > 0) {
			this.visible = true;
			this.state = 'zoomingOut';
		} else {
			this.visible = true;
			this.state = 'holding';
		}
	}

	updateZoomingIn(time) {
	}

	updateHolding(time) {
	}

	updateZoomingOut(time) {
	}

};
