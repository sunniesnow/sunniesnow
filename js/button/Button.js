Sunniesnow.Button = class Button extends PIXI.Container {
	static async load() {
	}
	
	constructor(onTrigger, priority = 100) {
		super();
		this.onTrigger = onTrigger;
		this.populate();
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
		this.boundsCache ??= this.getBounds(false).rectangle;
		return this.boundsCache;
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
