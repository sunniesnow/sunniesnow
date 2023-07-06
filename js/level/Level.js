Sunniesnow.Level = class Level {
	constructor() {
		this.initializeAuxiliaryQuantities();
		this.initializeNoteStores();
		this.notesCount = this.unhitNotes.length;
		this.initializePlayInfo();
		if (!Sunniesnow.game.settings.autoplay) {
			this.initializeManualPlay();
		}
	}

	initializeAuxiliaryQuantities() {
		this.judgementWindows = Sunniesnow.Config.judgementWindows[Sunniesnow.game.settings.judgementWindows];
		[this.earliestLateBad, this.latestLateBad] = Sunniesnow.Utils.minmax(
			this.judgementWindows.tap.bad[1],
			this.judgementWindows.drag.bad[1],
			this.judgementWindows.flick.bad[1],
			this.judgementWindows.hold.bad[1]
		);
		[this.earliestEarlyBad, this.latestEarlyBad] = Sunniesnow.Utils.minmax(
			this.judgementWindows.tap.bad[0],
			this.judgementWindows.drag.bad[0],
			this.judgementWindows.flick.bad[0],
			this.judgementWindows.hold.bad[0]
		);
	}

	initializeNoteStores() {
		this.unhitNotes = [];
		for (const event of Sunniesnow.game.chart.events) {
			if (event instanceof Sunniesnow.Note) {
				this.unhitNotes.push(new event.constructor.LEVEL_CLASS(event));
			}
		}
		this.unhitNotes.sort((a, b) => a.time - b.time);
		this.holdingNotes = [];
	}

	initializePlayInfo() {
		this.perfect = 0;
		this.good = 0;
		this.bad = 0;
		this.miss = 0;
		this.combo = 0;
		this.maxCombo = 0;
		this.lastJudgement = null;
		this.apFcIndicator = 'ap'; // possible values: 'ap', 'fc', ''
	}

	initializeManualPlay() {
		this.touches = {};
		this.needUpdateTouches = true;
		this.lastTouchList = [];
	}

	score() {
		const accuracy = this.effectiveHits() / this.notesCount;
		return Math.floor(900000 * accuracy + 100000 * this.maxCombo / this.notesCount);
	}

	accuracy() {
		const denominator = this.perfect + this.good + this.bad + this.miss;
		return denominator === 0 ? 1 : this.effectiveHits() / denominator;
	}

	effectiveHits() {
		return this.perfect + this.good / 2 + this.bad / 10;
	}

	update(time) {
		if (Sunniesnow.game.settings.autoplay) {
			this.updateAutoPlay(time);
		} else {
			this.updateManualPlay(time);
		}
	}

	updateAutoPlay(time) {
		while (this.unhitNotes.length > 0) {
			const note = this.unhitNotes[0];
			if (time >= note.time) {
				note.hit(null, note.time);
			} else {
				break;
			}
		}
		this.updateFinishingHolds(time);
	}

	updateManualPlay(time) {
		for (let i = 0; i < this.unhitNotes.length;) {
			const note = this.unhitNotes[i];
			if (time < note.time + this.earliestLateBad) {
				break;
			}
			const lateBad = this.judgementWindows[note.type].bad[1];
			if (time >= note.time + lateBad) {
				note.miss(lateBad);
			} else {
				i++;
			}
		}
		this.updateFinishingHolds(time);
	}

	updateFinishingHolds(time) {
		for (let i = 0; i < this.holdingNotes.length;) {
			const note = this.holdingNotes[i];
			if (time < note.endTime) {
				break;
			}
			if (note.autoFinishesHolding() || Sunniesnow.game.settings.autoplay) {
				note.release(note.endTime);
			} else {
				i++;
			}
		}
	}

	onTouch(touchList, time) {
		const updated = {};
		for (let i = 0; i < touchList.length; i++) {
			const touch = touchList[i];
			const id = touch.identifier;
			const [x, y] = Sunniesnow.Config.pageMapping(touch.pageX, touch.pageY);
			if (this.touches[id]) {
				this.touches[id].history.push({time, x, y});
				const note = this.touches[id].note;
				if (note && note.holding) {
					note.updateHolding();
				}
			} else {
				this.newTouch(id, time, x, y);
			}
			updated[id] = true;
		}
		for (const id in this.touches) {
			if (updated[id]) {
				continue;
			}
			const note = this.touches[id].note;
			if (note) {
				note.release(time);
			}
			delete this.touches[id];
		}
		this.scanDrags(time);
		this.lastTouchList = touchList;
	}

	newTouch(id, time, x, y) {
		const touch = this.touches[id] = {id: id, history: [{time, x, y}]};
		for (let i = 0; i < this.unhitNotes.length;) {
			let note = this.unhitNotes[i];
			if (time < note.time + this.earliestEarlyBad) {
				break;
			}
			if (time >= note.time + this.judgementWindows[note.type].bad[0]) {
				note = this.tryHitNote(note, touch, time);
				if (note.onlyOnePerTouch()) {
					break;
				} else {
					i++;
				}
			} else {
				i++;
			}
		}
	}

	// What if a touch can potentially hit different simultaneous notes at this position?
	// Pick the one that is the nearest!
	// However, we should avoid hitting drags as possible.
	// The function hits the most appropriate note and returns the actually hit note.
	tryHitNote(note, touch, time) {
		const {x, y} = touch.history[0];
		const events = note.event.simultaneousEvents;
		// Should we replace Euclidean distance with L-infinity distance?
		let distance = Sunniesnow.Utils.distance(x, y, note.event.x, note.event.y);
		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			const newNote = event.levelNote;
			if (!newNote || newNote.hitRelativeTime !== null) {
				continue;
			}
			const newDistance = Sunniesnow.Utils.distance(x, y, event.x, event.y);
			let condition = (!note.onlyOnePerTouch() || newDistance < distance) && newNote.onlyOnePerTouch();
			condition ||= !note.onlyOnePerTouch() && !newNote.onlyOnePerTouch() && newDistance < distance;
			if (condition && newNote.isTappableAt(x, y)) {
				note = newNote;
				distance = newDistance;
			}
		}
		note.hit(touch, time);
		return note;
	}

	onNewJudgement(note) {
		switch (note.judgement) {
			case 'good':
				if (this.apFcIndicator === 'ap') {
					this.apFcIndicator = 'fc';
				}
			case 'perfect':
				this.combo++;
				break;
			case 'bad':
			case 'miss':
				this.apFcIndicator = '';
				this.combo = 0;
				break;
		}
		this.maxCombo = Math.max(this.maxCombo, this.combo);
		this.lastJudgement = note.judgement;
		this[note.judgement]++;
	}

	scanDrags(time) {
		for (let i = 0; i < this.unhitNotes.length; i++) {
			const note = this.unhitNotes[i];
			if (note.type !== 'drag') {
				continue;
			}
			if (time < note.time + this.judgementWindows.drag.bad[0]) {
				break;
			}
			for (const id in this.touches) {
				const touch = this.touches[id];
				const {time, x, y} = touch.history[touch.history.length - 1];
				if (note.isTappableAt(x, y)) {
					note.hit(touch, time);
				}
			}
		}
		for (let i = 0; i < this.holdingNotes.length; i++) {
			const note = this.holdingNotes[i];
			if (note.type !== 'drag') {
				continue;
			}
			if (time < note.endTime + this.judgementWindows.drag.bad[0]) {
				break;
			}
			for (const id in this.touches) {
				const touch = this.touches[id];
				const {time, x, y} = touch.history[touch.history.length - 1];
				if (note.isTappableAt(x, y)) {
					note.refreshJudgement(time);
				}
			}
		}
	}
};
