Sunniesnow.Button = class Button extends PIXI.Container {
	static async load() {
	}
	
	constructor(onTrigger) {
		super();
		this.onTrigger = onTrigger;
		this.populate();
		this.getBounds(false);
	}

	populate() {
	}

	hitRegion() {
		return this._bounds.getRectangle();
	}

	triggerIfContains(x, y) {
		if (!this.worldVisible) {
			return false;
		}
		if (this.hitRegion().contains(x, y)) {
			this.onTrigger();
			return true;
		}
		return false;
	}

	triggerIfContainsPage(x, y) {
		return this.triggerIfContains(
			...Sunniesnow.Utils.pageToCanvasCoordinates(x, y, Sunniesnow.game.canvas)
		);
	}
};
