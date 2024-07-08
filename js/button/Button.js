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
		Sunniesnow.TouchManager.addStartListener(this.startListener, priority);
	}

	onTouchStart(touch) {
		const {canvasX, canvasY} = touch.start();
		return this.triggerIfContains(canvasX, canvasY);
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
		if (Sunniesnow.Utils.inScreen(x, y) && this.hitRegion().contains(x, y)) {
			this.onTrigger();
			return true;
		}
		return false;
	}
};
