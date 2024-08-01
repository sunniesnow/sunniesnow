Sunniesnow.Chart = class Chart {

	static META_FIELDS = {
		title: '',
		artist: '',
		charter: '',
		difficultyName: 'Unknown',
		difficultyColor: '#7f7f7f',
		difficulty: '',
		difficultySup: ''
	}

	static EVENT_FIELDS = ['time', 'type', 'properties']
	
	static async load() {
		Sunniesnow.game.chart = new this(Sunniesnow.Loader.loaded.chart.charts[Sunniesnow.game.settings.chartSelect]);
		await Sunniesnow.game.chart.readSscharterInfo();
		Sunniesnow.Music.start = Math.min(
			Sunniesnow.game.settings.start * Sunniesnow.Music.duration,
			Sunniesnow.game.settings.speed === 0 ? Infinity : Sunniesnow.game.chart.eventsSortedByAppearTime[0].appearTime()
		) - Sunniesnow.game.settings.beginningPreparationTime;
		if (!Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.Audio.loadOfflineAudioContext();
		}
	}

	constructor(data) {
		if (!data) {
			Sunniesnow.Logs.error('There is no chart');
		}
		this.data = data;
		this.readMeta();
		this.readEvents();
		this.eventsPostProcess();
	}

	readMeta() {
		for (const field in Sunniesnow.Chart.META_FIELDS) {
			if (this.data[field] != null) {
				this[field] = this.data[field];
			} else {
				this[field] = Sunniesnow.Chart.META_FIELDS[field];
				Sunniesnow.Logs.warn(`Missing \`${field}\` in chart`);
			}
		}
	}
	
	async readSscharterInfo() {
		if (!this.data.sscharter) {
			return;
		}
		await Sunniesnow.Sscharter.connect(this.data.sscharter);
	}

	readEvents() {
		this.events = [];
		const duration = Sunniesnow.Music.duration;
		const start = Sunniesnow.game.settings.start * duration - Sunniesnow.game.settings.resumePreparationTime;
		const end = Sunniesnow.game.settings.end * duration;
		const offset = Sunniesnow.game.settings.chartOffset;
		this.data.events.forEach((eventData, id) => {
			if (!Sunniesnow.Event.check(eventData)) {
				return;
			}
			const {type, time, properties} = this.readEventMeta(eventData);
			const reducedTime = (time + offset) / Sunniesnow.game.settings.gameSpeed;
			if (!Sunniesnow.Utils.between(reducedTime, start, end)) {
				return;
			}
			const event = Sunniesnow.Event.newFromType(type, reducedTime, properties);
			if (!event) {
				return;
			}
			event.id = id;
			this.events.push(event);
		});
	}

	readEventMeta(eventData) {
		const result = {}
		for (const field of Sunniesnow.Chart.EVENT_FIELDS) {
			result[field] = eventData[field];
			if (!Object.hasOwn(result, field)) {
				Sunniesnow.Logs.warn(`Missing \`${field}\` in event`);
				return null;
			}
		}
		return result;
	}

	endTime() {
		const index = this.events.findLastIndex(event => event instanceof Sunniesnow.Note);
		return this.events[index].endTime();
	}

	eventsPostProcess() {
		if (this.events.length === 0) {
			Sunniesnow.Logs.error('There are no events in the chart in the specified range');
		}
		this.events.sort((a, b) => a.time - b.time);
		for (let i = 0; i < this.events.length - 1; i++) {
			const event1 = this.events[i];
			const event2 = this.events[i + 1];
			if (event1.time === event2.time) {
				event1.simultaneousEvents.push(event2);
				event2.simultaneousEvents = event1.simultaneousEvents;
			}
		}
		this.eventsSortedByAppearTime = this.events.toSorted((a, b) => a.appearTime() - b.appearTime());
		this.eventsSortedByEndTime = this.events.toSorted((a, b) => a.endTime() - b.endTime());
		this.eventsSortedByEndTime.filter(event => event instanceof Sunniesnow.Note).forEach((note, i) => note.comboIndex = i + 1);
	}

};
