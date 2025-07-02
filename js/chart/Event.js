Sunniesnow.Event = class Event {

	static PROPERTIES = {
		required: [],
		optional: {}
	}

	// key: property name
	// value: {speed: 0, value:, interpolable: true}
	// Omitted value uses the value from property
	static TIME_DEPENDENT = {}

	static UI_CLASS = 'UiEvent'
	static TYPE_NAME = 'event'

	static from(data, chart) {
		const eventClass = this.check(data)
		if (!eventClass) {
			return null;
		}
		// See reduceTime() for the formula
		const time = (data.time + chart.totalOffset) / Sunniesnow.game.settings.gameSpeed;
		if (time > chart.end) {
			return null;
		}
		const result = new eventClass(data.time, data.properties, data.timeDependent, chart.totalOffset);
		if (!result.checkProperties()) {
			return null;
		}
		result.data = data;
		return result;
	}

	static check(eventData) {
		if (!eventData || typeof eventData !== 'object') {
			Sunniesnow.Logs.warn('Found an event that is not an object');
			return null;
		}
		if (typeof eventData.time !== 'number') {
			Sunniesnow.Logs.warn('Found an event that does not have a time');
			return null;
		}
		if (typeof eventData.type !== 'string') {
			Sunniesnow.Logs.warn('Found an event that does not have a type');
			return null;
		}
		const eventClass = Sunniesnow[Sunniesnow.Utils.upcaseFirst(eventData.type)];
		if (!(eventClass?.prototype instanceof Sunniesnow.Event)) {
			Sunniesnow.Logs.warn(`Unknown event type \`${eventData.type}\``);
			return null;
		}
		if (typeof eventData.properties !== 'object') {
			Sunniesnow.Logs.warn('Found an event that does not have properties');
			return null;
		}
		for (const property of eventClass.PROPERTIES.required) {
			if (!Object.hasOwn(eventData.properties, property)) {
				Sunniesnow.Logs.warn(`Missing property \`${property}\` in ${eventData.type} event`);
				return null;
			}
		}
		if (eventData.timeDependent !== undefined && typeof eventData.timeDependent !== 'object') {
			Sunniesnow.Logs.warn('Found an event that does not have timeDependent');
			return null;
		}
		return eventClass;
	}

	assignProperties(properties) {
		properties = Object.assign({}, properties);
		for (const property of this.constructor.PROPERTIES.required) {
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
			Sunniesnow.Logs.warn(`Unknown property \`${property}\` in ${this.constructor.TYPE_NAME} event`);
		}
	}

	assignTimeDependent(timeDependent) {
		this.timeDependent = {};
		timeDependent = Object.assign({}, timeDependent);
		for (const property in this.constructor.TIME_DEPENDENT) {
			if (Object.hasOwn(timeDependent, property)) {
				this.timeDependent[property] = timeDependent[property];
				delete timeDependent[property];
			} else {
				this.timeDependent[property] = this.constructor.TIME_DEPENDENT[property];
			}
			const options = this.timeDependent[property];
			options.interpolable ??= true;
			if (options.interpolable) {
				options.speed ??= 0;
				options.value ??= this[property];
			}
			options.dataPoints ??= [];
		}
		for (const property in timeDependent) {
			Sunniesnow.Logs.warn(`Unknown time dependent property \`${property}\` in ${this.constructor.TYPE_NAME} event`);
		}
	}

	reduceTime(offset) {
		this.time = (this.time + offset) / Sunniesnow.game.settings.gameSpeed;
		if (this.duration) {
			this.duration /= Sunniesnow.game.settings.gameSpeed;
		}
		for (const property in this.timeDependent) {
			this.timeDependent[property].dataPoints.forEach(point => {
				point.time = (point.time + offset) / Sunniesnow.game.settings.gameSpeed;
			});
		}
	}

	constructor(time, properties, timeDependent, offset) {
		this.time = time;
		this.assignProperties(properties);
		this.assignTimeDependent(timeDependent);
		if (offset != null) {
			this.reduceTime(offset);
		}
		this.simultaneousEvents = [this];
	}

	uiClass() {
		return Sunniesnow[this.constructor.UI_CLASS];
	}

	appearTime() {
		return this.time - this.uiClass().fadingInDuration(this);
	}

	endTime() {
		return this.time + (this.duration || 0);
	}

	disappearTime() {
		return this.endTime() + this.uiClass().fadingOutDuration(this);
	}

	newUiEvent() {
		return new (this.uiClass())(this);
	}

	checkProperties() {
		return true;
	}

	assertType(property, expected) {
		const type = typeof this[property];
		if (type !== expected) {
			Sunniesnow.Logs.warn(`Property \`${property}\` in ${this.constructor.TYPE_NAME} event must be ${expected}, but got ${this[property]}: ${type}`);
			return false;
		}
		return true;
	}

	toPlaceholder() {
		const result = new Sunniesnow.Placeholder(
			this.time,
			{tipPoint: this.tipPoint, x: this.x, y: this.y},
			{}
		);
		result.id = this.id;
		result.data = this.data;
		return result;
	}

	timeDependentAt(property, time) {
		// TODO
	}
};
