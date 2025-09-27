Sunniesnow.Touch = class Touch {
	constructor(id, type, time, pageX, pageY, ctrlKey, shiftKey, altKey, options = {}) {
		this.id = id;
		this.type = type;
		this.ctrlKey = ctrlKey;
		this.shiftKey = shiftKey;
		this.altKey = altKey;
		switch (type) {
			case 'mouse':
				this.wholeScreen = Sunniesnow.game.settings.mouseWholeScreen;
				this.button = options.button;
				break;
			case 'key':
				this.wholeScreen = Sunniesnow.game.settings.keyboardWholeScreen;
				this.key = options.key;
				break;
			case 'touch':
				this.wholeScreen = Sunniesnow.game.settings.touchscreenWholeScreen;
				this.identifier = options.identifier;
				break;
		}
		const [x, y, canvasX, canvasY] = Sunniesnow.Config.pageMapping(pageX, pageY);
		this.history = [{time, x, y, canvasX, canvasY, pageX, pageY}];
		this.finished = false;
	}

	move(time, pageX, pageY) {
		const [x, y, canvasX, canvasY] = Sunniesnow.Config.pageMapping(pageX, pageY);
		this.history.push({time, x, y, canvasX, canvasY, pageX, pageY});
	}

	start() {
		return this.history[0];
	}

	end() {
		return this.history[this.history.length - 1];
	}

	trivialMove() {
		const {pageX, pageY} = this.end();
		this.move(Sunniesnow.Music.currentTime, pageX, pageY);
	}

	timeElapsed() {
		return this.end().time - this.start().time;
	}

	totalMovement() {
		return [this.end().x - this.start().x, this.end().y - this.start().y];
	}

	totalDisplacement() {
		return Math.hypot(...this.totalMovement());
	}

	static key(key, time, x, y, ctrlKey, shiftKey, altKey) {
		return new this(Sunniesnow.TouchManager.keyId(key), 'key', time, x, y, ctrlKey, shiftKey, altKey, {key});
	}

	static mouseButton(button, time, x, y, ctrlKey, shiftKey, altKey) {
		return new this(Sunniesnow.TouchManager.mouseButtonId(button), 'mouse', time, x, y, ctrlKey, shiftKey, altKey, {button});
	}

	static domTouch(identifier, time, x, y, ctrlKey, shiftKey, altKey) {
		return new this(Sunniesnow.TouchManager.touchId(identifier), 'touch', time, x, y, ctrlKey, shiftKey, altKey, {identifier});
	}
};
