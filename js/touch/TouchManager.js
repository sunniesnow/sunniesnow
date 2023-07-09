Sunniesnow.TouchManager = {

	// format: {id: {id:, history: [{time:, x:, y:}, ...]}, ...}
	touches: {},

	startListeners: [],
	moveListeners: [],
	endListeners: [],

	clear() {
		this.touches = {};
	},

	update() {
		for (const id in this.touches) {
			const touch = this.touches[id];
			if (touch.needsUpdating) {
				touch.trivialMove();
				this.onMove(touch);
			}
			touch.needsUpdating = true;
		}
	},

	keyId(keyCode) {
		return `key${keyCode}`;
	},

	mouseButtonId(button) {
		return `mouse${button}`;
	},

	touchId(identifier) {
		return `touch${identifier}`;
	},

	onStart(touch) {
		for (const listener of this.startListeners) {
			listener(touch);
		}
	},

	onMove(touch) {
		for (const listener of this.moveListeners) {
			listener(touch);
		}
		touch.needsUpdating = false;
	},

	onEnd(touch) {
		for (const listener of this.endListeners) {
			listener(touch);
		}
	},

	keyDown(event) {
		const id = this.keyId(event.keyCode);
		if (this.touches[id]) { // this keydown event is fired by holding a key
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		const touch = Sunniesnow.Touch.key(event.keyCode, time, this.mouseX, this.mouseY);
		this.touches[id] = touch;
		this.onStart(touch);
	},

	keyUp(event) {
		const id = this.keyId(event.keyCode);
		const touch = this.touches[id];
		if (!touch) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		delete this.touches[id];
		touch.move(time, this.mouseX, this.mouseY);
		this.onEnd(touch);
	},

	mouseDown(event) {
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		[this.mouseX, this.mouseY] = Sunniesnow.Config.pageMapping(event.pageX, event.pageY);
		const id = this.mouseButtonId(event.button);
		const touch = Sunniesnow.Touch.mouseButton(event.button, time, this.mouseX, this.mouseY);
		this.touches[id] = touch;
		this.onStart(touch);
	},

	mouseMove(event) {
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		[this.mouseX, this.mouseY] = Sunniesnow.Config.pageMapping(event.pageX, event.pageY);
		for (const id in this.touches) {
			const touch = this.touches[id];
			if (!touch) {
				continue;
			}
			if (touch.type === 'mouse' || touch.type === 'key') {
				touch.move(time, this.mouseX, this.mouseY);
				this.onMove(touch);
			}
		}
	},

	mouseUp(event) {
		const id = this.mouseButtonId(event.button);
		const touch = this.touches[id];
		if (!touch) {
			return;
		}
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		[this.mouseX, this.mouseY] = Sunniesnow.Config.pageMapping(event.pageX, event.pageY);
		delete this.touches[id];
		touch.move(time, this.mouseX, this.mouseY);
		this.onEnd(touch);
	},

	touchStart(event) {
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		for (const domTouch of event.changedTouches) {
			const id = this.touchId(domTouch.identifier);
			const [x, y] = Sunniesnow.Config.pageMapping(domTouch.pageX, domTouch.pageY);
			const touch = Sunniesnow.Touch.domTouch(domTouch.identifier, time, x, y);
			this.touches[id] = touch;
			this.onStart(touch);
		}
	},

	touchMove(event) {
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		for (const domTouch of event.changedTouches) {
			const id = this.touchId(domTouch.identifier);
			const touch = this.touches[id]
			if (!touch) {
				continue;
			}
			const [x, y] = Sunniesnow.Config.pageMapping(domTouch.pageX, domTouch.pageY);
			touch.move(time, x, y);
			this.onMove(touch);
		}
	},

	touchEnd(event) {
		const time = Sunniesnow.Music.convertTimeStamp(event.timeStamp);
		for (const domTouch of event.changedTouches) {
			const id = this.touchId(domTouch.identifier);
			const touch = this.touches[id];
			if (!touch) {
				continue;
			}
			const [x, y] = Sunniesnow.Config.pageMapping(domTouch.pageX, domTouch.pageY);
			delete this.touches[id];
			touch.move(time, x, y);
			this.onEnd(touch);
		}
	},

	addStartListener(listener) {
		this.startListeners.push(listener);
	},

	addMoveListener(listener) {
		this.moveListeners.push(listener);
	},

	addEndListener(listener) {
		this.endListeners.push(listener);
	},

	removeStartListener(listener) {
		const index = this.startListeners.indexOf(listener);
		if (index >= 0) {
			this.startListeners.splice(index, 1);
		}
	},

	removeMoveListener(listener) {
		const index = this.moveListeners.indexOf(listener);
		if (index >= 0) {
			this.moveListeners.splice(index, 1);
		}
	},

	removeEndListener(listener) {
		const index = this.endListeners.indexOf(listener);
		if (index >= 0) {
			this.endListeners.splice(index, 1);
		}
	}
};
