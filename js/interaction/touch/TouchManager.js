Sunniesnow.TouchManager = {

	// format: {id: Touch, ...}
	touches: {},

	startListeners: [],
	moveListeners: [],
	endListeners: [],

	clear() {
		for (const id in this.touches) {
			this.onEnd(this.touches[id]);
		}
		this.touches = {};
		this.touchEffectsBoard?.clear();
	},

	clearListeners() {
		this.startListeners = [];
		this.moveListeners = [];
		this.endListeners = [];
	},

	update(delta) {
		for (const id in this.touches) {
			const touch = this.touches[id];
			if (touch.needsUpdating) {
				touch.trivialMove();
				this.onMove(touch);
			}
			touch.needsUpdating = true;
		}
	},

	keyId(key) {
		return `key-${key}`;
	},

	mouseButtonId(button) {
		return `mouse-${button}`;
	},

	touchId(identifier) {
		return `touch-${identifier}`;
	},

	onStart(touch) {
		document.activeElement.blur();
		Sunniesnow.game.window.focus(); // In VSCode Simple Browser, this acquires focus lock
		const existingTouch = this.touches[touch.id];
		if (existingTouch) {
			existingTouch.history.push(touch.start());
			this.onMove(existingTouch);
			return;
		}
		this.touches[touch.id] = touch;
		return this.callListeners(this.startListeners, touch);
	},

	onMove(touch) {
		const result = this.callListeners(this.moveListeners, touch);
		touch.needsUpdating = false;
		return result;
	},

	onEnd(touch) {
		touch.finished = true;
		return this.callListeners(this.endListeners, touch);
	},

	callListeners(listenerList, touch) {
		for (const [priority, listener] of listenerList) {
			if (listener(touch)) {
				return true;
			}
		}
		return false;
	},

	setMouse(event) {
		this.mousePageX = event.pageX;
		this.mousePageY = event.pageY;
	},

	mouseOut() {
		const [x, y] = Sunniesnow.Utils.pageToCanvasCoordinates(this.mousePageX, this.mousePageY, Sunniesnow.game.canvas);
		return x < 0 || y < 0 || x >= Sunniesnow.Config.WIDTH || y >= Sunniesnow.Config.HEIGHT;
	},

	keyDown(event) {
		if (this.shouldIgnoreKey(event)) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		const ctrlKey = navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey;
		const touch = Sunniesnow.Touch.key(event.key, time, this.mousePageX, this.mousePageY, ctrlKey, event.shiftKey, event.altKey);
		return this.onStart(touch);
	},

	keyUp(event) {
		if (this.shouldIgnoreKey(event)) {
			return;
		}
		const id = this.keyId(event.key);
		const touch = this.touches[id];
		if (!touch) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		delete this.touches[id];
		touch.move(time, this.mouseX, this.mouseY);
		this.onEnd(touch);
	},

	shouldIgnoreKey(event) {
		if (!Sunniesnow.game.settings.enableKeyboard) {
			return true;
		}
		if (Sunniesnow.game.settings.excludeKeys.includes(event.key)) {
			return true;
		}
		return false;
	},

	mouseDown(event) {
		this.setMouse(event);
		if (this.shouldIgnoreMouse(event)) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		const ctrlKey = navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey;
		const touch = Sunniesnow.Touch.mouseButton(event.button, time, this.mousePageX, this.mousePageY, ctrlKey, event.shiftKey, event.altKey);
		return this.onStart(touch);
	},

	mouseMove(event) {
		this.setMouse(event);
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		for (const id in this.touches) {
			const touch = this.touches[id];
			if (!touch) {
				continue;
			}
			if (touch.type === 'mouse' || touch.type === 'key') {
				touch.move(time, this.mousePageX, this.mousePageY);
				this.onMove(touch);
			}
		}
	},

	mouseUp(event) {
		if (this.shouldIgnoreMouse(event)) {
			return;
		}
		const id = this.mouseButtonId(event.button);
		const touch = this.touches[id];
		if (!touch) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		delete this.touches[id];
		touch.move(time, this.mousePageX, this.mousePageY);
		this.onEnd(touch);
	},

	shouldIgnoreMouse(event) {
		if (!Sunniesnow.game.settings.enableMouse) {
			return true;
		}
		if (Sunniesnow.game.settings.excludeButtons.some(s => Number(s) === event.button)) {
			return true;
		}
		return false;
	},

	touchStart(event) {
		if (this.shouldIgnoreTouch(event)) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		const ctrlKey = navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey;
		let result = false;
		for (const domTouch of event.changedTouches) {
			const touch = Sunniesnow.Touch.domTouch(domTouch.identifier, time, domTouch.pageX, domTouch.pageY, ctrlKey, event.shiftKey, event.altKey);
			result = this.onStart(touch) || result;
		}
		return result;
	},

	touchMove(event) {
		if (this.shouldIgnoreTouch(event)) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		let result = false;
		for (const domTouch of event.changedTouches) {
			const id = this.touchId(domTouch.identifier);
			const touch = this.touches[id]
			if (!touch) {
				continue;
			}
			touch.move(time, domTouch.pageX, domTouch.pageY);
			result = this.onMove(touch) || result;
		}
		return result;
	},

	touchEnd(event) {
		if (this.shouldIgnoreTouch(event)) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		let result = false;
		for (const domTouch of event.changedTouches) {
			const id = this.touchId(domTouch.identifier);
			const touch = this.touches[id];
			if (!touch) {
				continue;
			}
			delete this.touches[id];
			touch.move(time, domTouch.pageX, domTouch.pageY);
			result = this.onEnd(touch) || result;
		}
		return result;
	},

	shouldIgnoreTouch(event) {
		return !Sunniesnow.game.settings.enableTouchscreen;
	},

	addStartListener(listener, priority = 0) {
		this.addListener(this.startListeners, listener, priority);
	},

	addMoveListener(listener, priority = 0) {
		this.addListener(this.moveListeners, listener, priority);
	},

	addEndListener(listener, priority = 0) {
		this.addListener(this.endListeners, listener, priority);
	},

	addListener(listenerList, listener, priority) {
		listenerList.unshift([priority, listener]);
		listenerList.sort(([p1, l1], [p2, l2]) => p2 - p1);
	},

	removeStartListener(listener) {
		return this.removeListener(this.startListeners, listener);
	},

	removeMoveListener(listener) {
		return this.removeListener(this.moveListeners, listener);
	},

	removeEndListener(listener) {
		return this.removeListener(this.endListeners, listener);
	},

	removeListener(listenerList, listener) {
		const index = listenerList.findIndex(([p, l]) => l === listener);
		if (index >= 0) {
			listenerList.splice(index, 1);
			return listener;
		} else {
			return null;
		}
	},

	addDomTouchListeners() {
		this.touchStartListener = event => {
			event.preventDefault();
			this.touchStart(event);
		}
		this.touchMoveListener = event => {
			event.preventDefault();
			this.touchMove(event);
		}
		this.touchEndListener = event => {
			event.preventDefault();
			this.touchEnd(event);
		}
		Sunniesnow.game.canvas.addEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.addEventListener('touchmove', this.touchMoveListener);
		Sunniesnow.game.canvas.addEventListener('touchend', this.touchEndListener);
	},

	removeDomTouchListeners() {
		if (!this.touchStartListener) {
			return;
		}
		Sunniesnow.game.canvas.removeEventListener('touchstart', this.touchStartListener);
		Sunniesnow.game.canvas.removeEventListener('touchmove', this.touchMoveListener);
		Sunniesnow.game.canvas.removeEventListener('touchend', this.touchEndListener);
	},

	addDomKeyListeners() {
		this.keyDownListener = event => {
			if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
				return;
			}
			if (this.keyDown(event)) {
				event.preventDefault();
			}
		}
		this.keyUpListener = event => {
			if (this.keyUp(event)) {
				event.preventDefault();
			}
		}
		Sunniesnow.game.document.addEventListener('keydown', this.keyDownListener);
		Sunniesnow.game.document.addEventListener('keyup', this.keyUpListener);
	},

	removeDomKeyListeners() {
		if (!this.keyDownListener) {
			return;
		}
		Sunniesnow.game.document?.removeEventListener('keydown', this.keyDownListener);
		Sunniesnow.game.document?.removeEventListener('keyup', this.keyUpListener);
	},

	addDomMouseListeners() {
		this.mouseDownListener = event => {
			event.preventDefault();
			this.mouseDown(event);
	}
		this.mouseMoveListener = event => {
			if (Sunniesnow.Utils.inScreenPage(event.pageX, event.pageY, Sunniesnow.game.canvas)) {
				event.preventDefault();
			}
			this.mouseMove(event);
		}
		this.mouseUpListener = event => {
			if (Sunniesnow.Utils.inScreenPage(event.pageX, event.pageY, Sunniesnow.game.canvas)) {
				event.preventDefault();
			}
			this.mouseUp(event);
		}
		Sunniesnow.game.canvas.addEventListener('mousedown', this.mouseDownListener);
		Sunniesnow.game.document.addEventListener('mousemove', this.mouseMoveListener);
		Sunniesnow.game.document.addEventListener('mouseup', this.mouseUpListener);
	},

	removeDomMouseListeners() {
		if (!this.mouseDownListener) {
			return;
		}
		Sunniesnow.game.canvas?.removeEventListener('mousedown', this.mouseDownListener);
		Sunniesnow.game.document?.removeEventListener('mousemove', this.mouseMoveListener);
		Sunniesnow.game.document?.removeEventListener('mouseup', this.mouseUpListener);
	},

	async load() {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		this.addDomTouchListeners();
		this.addDomKeyListeners();
		this.addDomMouseListeners();
	},

	terminate() {
		this.removeDomTouchListeners();
		this.removeDomKeyListeners();
		this.removeDomMouseListeners();
		this.clearListeners();
	}

};
