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
			return new eventClass(time, properties);
		} else {
			Sunniesnow.Utils.error(`Unknown event type \`${type}\``);
		}
	}

	constructor(time, properties) {
		this.time = time / Sunniesnow.game.settings.gameSpeed;
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

	newUiEvent() {
		return new Sunniesnow[this.constructor.UI_CLASS](this, ...arguments);
	}
};
