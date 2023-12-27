Sunniesnow.Event = class Event {

	static PROPERTIES = {
		required: [],
		optional: {}
	}

	static UI_CLASS = 'UiEvent'
	static TYPE_NAME = 'event'

	static newFromType(type, time, properties) {
		const eventClass = Sunniesnow[Sunniesnow.Utils.upcaseFirst(type)];
		if (eventClass?.prototype instanceof Sunniesnow.Event) {
			for (const property of eventClass.PROPERTIES.required) {
				if (!Object.hasOwn(properties, property)) {
					Sunniesnow.Utils.warn(`Missing property \`${property}\` in ${type} event`);
					return null;
				}
			}
			const result = new eventClass(time, properties);
			if (!result.checkProperties()) {
				return null;
			}
			return result;
		} else {
			Sunniesnow.Utils.warn(`Unknown event type \`${type}\``);
		}
	}

	static check(eventData) {
		if (!eventData || typeof eventData !== 'object') {
			Sunniesnow.Utils.warn('Found an event that is not an object');
			return false;
		}
		if (typeof eventData.time !== 'number') {
			Sunniesnow.Utils.warn('Found an event that does not have a time');
			return false;
		}
		if (typeof eventData.type !== 'string') {
			Sunniesnow.Utils.warn('Found an event that does not have a type');
			return false;
		}
		return true;
	}

	constructor(time, properties) {
		this.time = time;
		properties = Object.assign({}, properties);
		for (const property of this.constructor.PROPERTIES.required) {
			if (!Object.hasOwn(properties, property)) {
				Sunniesnow.Utils.error(`Missing property \`${property}\` in ${this.constructor.TYPE_NAME} event`);
			}
			this[property] = properties[property];
			delete properties[property];
		}
		for (const property in this.constructor.PROPERTIES.optional) {
			if (Object.hasOwn(properties, property)) {
				this[property] = properties[property]
				delete properties[property];
			} else {
				this[property] = this.constructor.PROPERTIES.optional[property];
			}
		}
		for (const property in properties) {
			Sunniesnow.Utils.warn(`Unknown property \`${property}\` in ${this.constructor.TYPE_NAME} event`);
		}
		if (this.duration) {
			this.duration /= Sunniesnow.game.settings.gameSpeed;
		}
		this.simultaneousEvents = [this];
	}

	appearTime() {
		return this.time - Sunniesnow[this.constructor.UI_CLASS].FADING_IN_DURATION;
	}

	endTime() {
		return this.time + (this.duration || 0);
	}

	newUiEvent(fxBoard, doubleLinesBoard, debugBoard) {
		return new Sunniesnow[this.constructor.UI_CLASS](this, fxBoard, debugBoard);
	}

	checkProperties() {
		return true;
	}

	assertType(property, expected) {
		const type = typeof this[property];
		if (type !== expected) {
			Sunniesnow.Utils.warn(`Property \`${property}\` in ${this.constructor.TYPE_NAME} event must be ${expected}, but got ${this[property]}: ${type}`);
			return false;
		}
		return true;
	}
};
