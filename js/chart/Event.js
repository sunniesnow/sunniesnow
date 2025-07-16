Sunniesnow.Event = class Event {

	// Override this to false in subclasses that should actually be instantiated.
	static ABSTRACT = true

	static PROPERTIES = {
		required: [],
		optional: {}
	}

	// key: property name
	// value: {speed: 0, value:, interpolable: true, nullable: false, noDefault: false}
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
		if (result instanceof Sunniesnow.FilterableEvent && !Sunniesnow.game.settings.disableOrnament) {
			result.assignFilters(data.filters, chart.totalOffset);
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
		if (!(eventClass?.prototype instanceof Sunniesnow.Event) || eventClass.ABSTRACT) {
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
			const options = Object.assign({}, this.constructor.TIME_DEPENDENT[property]);
			if (Object.hasOwn(timeDependent, property)) {
				if (!Sunniesnow.game.settings.disableOrnament) {
					Object.assign(options, timeDependent[property]);
				}
				delete timeDependent[property];
			} else if (options.noDefault) {
				this.timeDependent[property] = {omitted: true};
				continue;
			}
			options.interpolable = this.constructor.TIME_DEPENDENT[property].interpolable ?? true;
			options.nullable = this.constructor.TIME_DEPENDENT[property].nullable ?? false;
			options.dataPoints = options.dataPoints?.map(x => Object.assign({}, x)) ?? [];
			options.value ??= this[property];
			if (options.interpolable && !options.nullable && options.value == null) {
				Sunniesnow.Logs.warn(`Time dependent property \`${property}\` in ${this.constructor.TYPE_NAME} event must have a value`);
				options.value = 0; // default value
			}
			Sunniesnow.Utils.eachWithRedoingIf(options.dataPoints, ({time, value}, i) => {
				let condition = typeof time !== 'number';
				if (options.interpolable) {
					condition ||= typeof value !== 'number';
				}
				if (condition) {
					Sunniesnow.Logs.warn(`Invalid data point in time dependent property \`${property}\` in ${this.constructor.TYPE_NAME} event`);
					options.dataPoints.splice(i, 1);
					return true;
				}
			});
			if (options.interpolable) {
				options.speed ??= 0;
				options.dataPoints.unshift({time: this.time, value: options.value});
			} else {
				options.dataPoints.unshift({time: -Infinity, value: options.value});
			}
			options.dataPoints.sort((a, b) => a.time - b.time);
			this.timeDependent[property] = options;
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
			if (this.timeDependent[property].omitted) {
				continue;
			}
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
		const result = new (this.uiClass())(this);
		this.uiEvent = result;
		return result;
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
		const {interpolable, speed, dataPoints, nullable, value, omitted} = this.timeDependent[property];
		if (nullable && value == null || omitted) {
			return null;
		}
		const index = Sunniesnow.Utils.bisectRight(dataPoints, ({time: t}) => t - time);
		if (!interpolable || index === dataPoints.length - 1) {
			// index is never -1 because there is a -Infinity.
			return dataPoints[index].value;
		}
		if (index === -1) {
			return dataPoints[0].value + speed * (time - dataPoints[0].time);
		}
		const {time: t1, value: v1} = dataPoints[index];
		const {time: t2, value: v2} = dataPoints[index + 1];
		let progress = (time - t1) / (t2 - t1);
		if (Number.isNaN(progress)) { // extremely unlikely, but put here for robustness
			progress = 1/2;
		}
		return v1 + (v2 - v1) * progress;
	}

	timeDependentAtRelative(property, relativeTime) {
		return this.timeDependentAt(property, this.time + relativeTime);
	}
};
