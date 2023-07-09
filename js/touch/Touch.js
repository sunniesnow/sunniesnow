Sunniesnow.Touch = class Touch {
	constructor(id, type, time, x, y) {
		this.id = id;
		this.type = type;
		this.history = [{time, x, y}];
	}

	move(time, x, y) {
		this.history.push({time, x, y});
	}

	start() {
		return this.history[0];
	}

	end() {
		return this.history[this.history.length - 1];
	}

	trivialMove() {
		const {x, y} = this.end();
		this.move(Sunniesnow.Music.currentTime, x, y);
	}

	static key(keyCode, time, x, y) {
		return new this(Sunniesnow.TouchManager.keyId(keyCode), 'key', time, x, y);
	}

	static mouseButton(button, time, x, y) {
		return new this(Sunniesnow.TouchManager.mouseButtonId(button), 'mouse', time, x, y);
	}

	static domTouch(identifier, time, x, y) {
		return new this(Sunniesnow.TouchManager.touchId(identifier), 'touch', time, x, y);
	}
};
