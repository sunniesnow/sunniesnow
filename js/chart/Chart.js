Sunniesnow.Chart = class Chart {

	static META_FIELDS = {
		title: '',
		artist: '',
		charter: '',
		difficultyName: 'Unknown',
		difficultyColor: 'white',
		difficulty: ''
	}

	static EVENT_FIELDS = ['time', 'type', 'properties']

	constructor(data) {
		if (!data) {
			Sunniesnow.Utils.error('There is no chart');
		}
		this.data = data;
		this.readMeta();
		this.readEvents();
	}

	readMeta() {
		for (const field in Sunniesnow.Chart.META_FIELDS) {
			if (this.data[field]) {
				this[field] = this.data[field];
			} else {
				this[field] = Sunniesnow.Chart.META_FIELDS[field];
				Sunniesnow.Utils.warn(`Missing \`${field}\` in chart`);
			}
		}
	}

	readEvents() {
		this.events = [];
		for (const eventData of this.data.events) {
			const {type, time, properties} = this.readEventMeta(eventData);
			this.events.push(Sunniesnow.Event.newFromType(type, time, properties));
		}
		this.events.sort((a, b) => a.appearTime() - b.appearTime());
		for (let i = 0; i < this.events.length - 1; i++) {
			const event1 = this.events[i];
			const event2 = this.events[i + 1];
			if (event1.time === event2.time) {
				event1.simultaneousEvents.push(event2);
				event2.simultaneousEvents = event1.simultaneousEvents;
			}
		}
	}

	readEventMeta(eventData) {
		const result = {}
		for (const field of Sunniesnow.Chart.EVENT_FIELDS) {
			result[field] = eventData[field];
			if (!Object.hasOwn(result, field)) {
				Sunniesnow.Utils.error(`Missing \`${field}\` in event`);
			}
		}
		return result;
	}

};
