Sunniesnow.DoubleLineBase = class DoubleLineBase extends PIXI.Container {

	constructor(uiEvent, x1, y1, x2, y2) {
		super();
		this.uiEvent = uiEvent;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.populate();
	}

	populate() {
	}

	updateFadingIn(progress, relativeTime) {
	}

	updateFadingOut(progress, relativeTime) {
	}

	updateActive(progress, relativeTime) {
	}

	updateHolding(progress, relativeTime) {
	}
};
