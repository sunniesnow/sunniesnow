Sunniesnow.Chart = class Chart {

	static META_FIELDS = {
		title: '',
		artist: '',
		charter: '',
		difficultyName: 'Unknown',
		difficultyColor: '#7f7f7f',
		difficulty: ''
	}

	static OPTIONAL_META_FIELDS = {
		difficultySup: '',
		sscharter: null,
		offset: 0
	}

	static async load() {
		Sunniesnow.game.chart = new this(Sunniesnow.game.settings.chartSelect);
		await Sunniesnow.game.chart.readSscharterInfo();
		await Sunniesnow.game.chart.checkAndLoadFilters();
		Sunniesnow.Music.setStart();
		if (!Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.Audio.loadOfflineAudioContext();
		}
	}

	constructor(data) {
		if (!data) {
			throw new Error('There is no chart');
		}
		this.data = data;
		this.readMeta();
		this.readFilters();
		this.init();
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
		for (const field in Sunniesnow.Chart.OPTIONAL_META_FIELDS) {
			this[field] = this.data[field] ?? Sunniesnow.Chart.OPTIONAL_META_FIELDS[field];
		}
	}

	async readSscharterInfo() {
		if (!this.sscharter || !Sunniesnow.game.settings.sscharter) {
			return;
		}
		await Sunniesnow.Sscharter.connect(this.sscharter);
	}

	readFilters() {
		this.filters = {};
		if (!this.data.filters) {
			return;
		}
		if (Sunniesnow.game.settings.disableOrnament) {
			return;
		}
		for (const label in this.data.filters) {
			const filterData = this.data.filters[label];
			if (!filterData || typeof filterData !== 'object') {
				Sunniesnow.Logs.warn(`Filter \`${label}\` is not an object`);
				continue;
			}
			this.filters[label] = Sunniesnow.Filter.from(label, filterData);
		}
	}

	init() {
		this.duration = Sunniesnow.Music.duration;
		this.start = Sunniesnow.game.settings.start * this.duration;
		this.end = Sunniesnow.game.settings.end * this.duration;
		this.totalOffset = this.offset + Sunniesnow.game.settings.chartOffset;
	}

	readEvents() {
		this.events = [];
		this.data.events.forEach((eventData, id) => {
			const event = Sunniesnow.Event.from(eventData, this);
			if (!event) {
				return;
			}
			event.id = id;
			this.events.push(event);
		});
	}

	endTime() {
		const index = this.events.findLastIndex(event => event instanceof Sunniesnow.Note);
		return this.events[index].endTime();
	}

	eventsPostProcess() {
		if (this.events.length === 0) {
			throw new Error('There are no events in the chart in the specified range');
		}
		this.events.sort((a, b) => a.time - b.time);
		this.applyTipPointSpeed();
		this.stripEvents();
		this.checkNoNotes();
		this.applyGlobalSpeed();
		this.setSimultaneousEvents();
		this.eventsSortedByAppearTime = this.events.toSorted((a, b) => a.appearTime() - b.appearTime());
		this.eventsSortedByEndTime = this.events.toSorted((a, b) => a.endTime() - b.endTime());
		this.eventsSortedByEndTime.filter(event => event instanceof Sunniesnow.Note && !event.fake).forEach((note, i) => note.comboIndex = i + 1);
		this.organizeTipPoints();
	}

	// Apply tipPointSpeed and tipPointDistance settings, assuming this.events are sorted by time.
	applyTipPointSpeed() {
		const tipPoints = new Map();
		for (const event of this.events) {
			if (event.tipPoint == null || event instanceof Sunniesnow.EffectTipPoint) {
				continue;
			}
			if (!tipPoints.has(event.tipPoint)) {
				tipPoints.set(event.tipPoint, event instanceof Sunniesnow.Placeholder ? event : null);
				continue;
			}
			const placeholder = tipPoints.get(event.tipPoint);
			if (!placeholder) {
				continue;
			}
			placeholder.time = event.time - (event.time - placeholder.time) * Sunniesnow.game.settings.tipPointDistance / Sunniesnow.game.settings.tipPointSpeed;
			placeholder.x = event.x - (event.x - placeholder.x) * Sunniesnow.game.settings.tipPointDistance;
			placeholder.y = event.y - (event.y - placeholder.y) * Sunniesnow.game.settings.tipPointDistance;
			tipPoints.set(event.tipPoint, null);
		}
	}

	// Event.from() already strips events after this.end,
	// but we still need to strip events before this.start.
	// This method assumes that this.events are sorted by time.
	stripEvents() {
		const tipPoints = new Map();
		const preparationStart = this.start - Sunniesnow.game.settings.beginningPreparationTime;
		for (let i = this.events.length - 1; i >= 0; i--) {
			const event = this.events[i];
			if (event.time >= preparationStart && event.tipPoint && !(event instanceof Sunniesnow.EffectTipPoint)) {
				tipPoints.set(event.tipPoint, false);
			}
			if (event instanceof Sunniesnow.Note && event.time < this.start || event.disappearTime() < preparationStart) {
				if (tipPoints.has(event.tipPoint)) {
					this.events[i] = tipPoints.get(event.tipPoint) ? null : event.toPlaceholder();
				} else {
					this.events[i] = null;
				}
			}
			if (event.time < preparationStart && tipPoints.has(event.tipPoint)) {
				tipPoints.set(event.tipPoint, true);
			}
		}
		Sunniesnow.Utils.compactify(this.events);
	}

	// if there are no notes in the chart, constructor of Level will throw outside of the loading phase,
	// resulting in error at a confusing time
	checkNoNotes() {
		for (const event of this.events) {
			if (event instanceof Sunniesnow.Note && !event.fake) {
				return;
			}
		}
		throw new Error('There are no notes in the chart in the specified range');
	}

	// This converts all the globalSpeed events to data points in timeDependent.circle of all the notes,
	// and then removes those events.
	// Assumes that this.events are sorted by time.
	// This then raises the question: why do we need globalSpeed events in the first place?
	// In principle, we could just use timeDependent.circle to achieve the same effect,
	// but it would make the chart file very large for charts with many notes.
	applyGlobalSpeed() {
		const notes = [];
		for (let i = this.events.length - 1; i >= 0; i--) {
			const event = this.events[i];
			if (event instanceof Sunniesnow.NoteBase) {
				notes.push(event);
			}
			if (!(event instanceof Sunniesnow.GlobalSpeed)) {
				continue;
			}
			this.events.splice(i, 1);
			if (Sunniesnow.game.settings.disableOrnament) {
				continue;
			}
			const {speed: globalSpeed, time} = event;
			for (const note of notes) {
				const {speed, dataPoints} = note.timeDependent.circle;
				const {time: t0, value: v0} = dataPoints[0];
				if (t0 <= time) {
					continue;
				}
				dataPoints.unshift({time, value: v0 + globalSpeed * speed * (time - t0)});
			}
		}
		for (const note of notes) {
			note.timeDependent.circle.dataPoints.forEach(point => point.value *= Sunniesnow.game.settings.speed);
			note.timeDependent.circle.speed *= Sunniesnow.game.settings.speed;
		}
	}

	setSimultaneousEvents() {
		for (let i = 0; i < this.events.length - 1; i++) {
			const event1 = this.events[i];
			const event2 = this.events[i + 1];
			if (event1.time === event2.time) {
				event1.simultaneousEvents.push(event2);
				event2.simultaneousEvents = event1.simultaneousEvents;
			}
		}
	}

	organizeTipPoints() {
		// [{id, events, appearTime, disappearTime, effects}, ...], sorted by events[0].time
		this.tipPoints = new Map();
		for (const event of this.events) {
			if (event.tipPoint == null) {
				continue;
			}
			if (!this.tipPoints.has(event.tipPoint)) {
				this.tipPoints.set(event.tipPoint, {effects: [], events: []});
			}
			this.tipPoints.get(event.tipPoint)[event instanceof Sunniesnow.EffectTipPoint ? 'effects' : 'events'].push(event);
		}
		// First convert to array then map instead of the other way around
		// because Safari and Firefox do not support Iterator.
		this.tipPoints = Array.from(this.tipPoints.entries()).map(
			([id, {events, effects}]) => ({
				id, events, effects,
				appearTime: events[0].time - Sunniesnow.TipPoint.ACTIVE_DURATION - Sunniesnow.Config.UI_PREPARATION_TIME,
				disappearTime: events[events.length - 1].time + Sunniesnow.TipPoint.ZOOMING_OUT_DURATION
			})
		);
		Sunniesnow.Utils.eachWithRedoingIf(
			this.tipPoints,
			({events}, i) => events.length === 0 && this.tipPoints.splice(i, 1)
		);
		this.tipPoints.sort((a, b) => a.appearTime - b.appearTime);
	}

	async checkAndLoadFilters() {
		if (Sunniesnow.game.settings.disableOrnament) {
			return;
		}
		for (const event of this.events) {
			if (!(event instanceof Sunniesnow.FilterableEvent)) {
				continue;
			}
			await Sunniesnow.Utils.deleteIfAsync(event.filterEvents, async e => !await e.checkAndLoad());
		}
	}

};
