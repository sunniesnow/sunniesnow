Sunniesnow.Button = class Button extends PIXI.Container {
	static async load() {
	}
	
	constructor(onTrigger, priority = 100) {
		super();
		this.onTrigger = onTrigger;
		this.populate();
		this.getBounds(false);
		this.addTouchListener(priority);
	}

	addTouchListener(priority) {
		this.startListener = this.onTouchStart.bind(this);
		Sunniesnow.TouchManager.addStartListener(this.startListener);
	}

	onTouchStart(touch) {
		const {pageX, pageY} = touch.start();
		return this.triggerIfContainsPage(pageX, pageY);
	}

	removeTouchListener() {
		Sunniesnow.TouchManager.removeStartListener(this.startListener);
	}

	destroy() {
		super.destroy();
		this.removeTouchListener();
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
