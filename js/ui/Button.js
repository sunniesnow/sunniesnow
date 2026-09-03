Sunniesnow.Button = class Button extends PIXI.Container {
	static async load() {
	}

	constructor(onTrigger, options) {
		super();
		const {priority, useTouchEnd} = Object.assign({priority: 100, useTouchEnd: false}, options);
		this.onTrigger = onTrigger;
		this.useTouchEnd = useTouchEnd
		this.populate();
		this.addTouchListener(priority);
	}

	addTouchListener(priority) {
		this.startListener = this.onTouchStart.bind(this);
		Sunniesnow.TouchManager.addStartListener(this.startListener, priority);
		if (!this.useTouchEnd) {
			return;
		}
		this.endListener = this.onTouchEnd.bind(this);
		Sunniesnow.TouchManager.addEndListener(this.endListener, priority);
	}

	onTouchStart(touch) {
		const {canvasX, canvasY} = touch.start();
		if (this.useTouchEnd) {
			if (this.contains(canvasX, canvasY)) {
				this.startTouch = touch;
				return true;
			}
			return false;
		}
		return this.triggerIfContains(canvasX, canvasY);
	}

	onTouchEnd(touch) {
		if (touch != this.startTouch) {
			return;
		}
		const {canvasX, canvasY} = touch.start();
		return this.triggerIfContains(canvasX, canvasY);
	}

	removeTouchListener() {
		Sunniesnow.TouchManager.removeStartListener(this.startListener);
		if (this.useTouchEnd) {
			Sunniesnow.TouchManager.removeEndListener(this.endListener);
		}
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

	contains(x, y) {
		return this.worldVisible && Sunniesnow.Utils.inScreen(x, y) && this.hitRegion().contains(x, y)
	}

	triggerIfContains(x, y) {
		if (this.contains(x, y)) {
			this.onTrigger();
			return true;
		}
		return false;
	}
};
