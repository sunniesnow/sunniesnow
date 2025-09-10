Sunniesnow.Level = class Level extends EventTarget {
	constructor() {
		super();
		this.initializeAuxiliaryQuantities();
		this.initializeNoteStores();
		this.notesCount = this.unhitNotes.length;
		this.initializePlayInfo();
		if (!Sunniesnow.game.settings.autoplay) {
			this.addTouchListeners();
		}
	}

	initializeAuxiliaryQuantities() {
		this.judgementWindows = Sunniesnow.Config.JUDGEMENT_WINDOWS;
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
				this.unhitNotes.push(event.newLevelNote());
			}
		}
		if (this.unhitNotes.length === 0) {
			Sunniesnow.Logs.error('No notes in the chart');
			throw new Error('No notes in the chart');
		}
		this.unhitNotes.sort((a, b) => a.time - b.time || b.judgementPriority() - a.judgementPriority());
		if (Sunniesnow.game.progressAdjustable) {
			this.allNotes = this.unhitNotes.slice();
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allNotes, e => e.time, e => e.endTime);
		}
		this.holdingNotes = [];
	}

	initializePlayInfo() {
		this.perfect = 0;
		this.good = 0;
		this.bad = 0;
		this.miss = 0;
		this.early = 0;
		this.late = 0;
		this.combo = 0;
		this.maxCombo = 0;
		this.inaccuracies = [];
		this.lastJudgement = null;
		this.lastJudgedNote = null;
		this.apFcIndicator = 'ap'; // possible values: 'ap', 'fc', ''
	}

	addTouchListeners() {
		Sunniesnow.TouchManager.addStartListener(
			this.touchStartListener = this.touchStart.bind(this),
			Sunniesnow.game.settings.notesPriorityOverPause ? 200 : 0
		);
		Sunniesnow.TouchManager.addMoveListener(this.touchMoveListener = this.touchMove.bind(this));
		Sunniesnow.TouchManager.addEndListener(this.touchEndListener = this.touchEnd.bind(this));
	}

	finish() {
		this.finished = true;
		this.removeTouchListeners();
	}

	removeTouchListeners() {
		if (!this.touchStartListener) {
			return;
		}
		Sunniesnow.TouchManager.removeStartListener(this.touchStartListener);
		Sunniesnow.TouchManager.removeMoveListener(this.touchMoveListener);
		Sunniesnow.TouchManager.removeEndListener(this.touchEndListener);
	}

	score() {
		const accuracy = this.effectiveHits() / this.notesCount;
		if (Sunniesnow.game.settings.lyrica5) {
			return Math.floor(1000000 * accuracy);
		} else {
			return Math.floor(900000 * accuracy + 100000 * this.maxCombo / this.notesCount);
		}
	}

	accuracy() {
		const denominator = this.perfect + this.good + this.bad + this.miss;
		return denominator === 0 ? 1 : this.effectiveHits() / denominator;
	}

	accuracyText() {
		return Sunniesnow.Utils.toPercentage(this.accuracy());
	}

	rank() {
		if (this.maxCombo === this.notesCount) {
			return 'S';
		}
		const score = this.score();
		if (score >= 900000) {
			return 'A';
		} else if (score >= 750000) {
			return 'B';
		} else if (score >= 600000) {
			return 'C';
		} else if (score >= 500000) {
			return 'D';
		} else {
			return 'E';
		}
	}

	effectiveHits() {
		const {perfect, good, bad, miss} = Sunniesnow.Config.ACCURACIES;
		return this.perfect * perfect + this.good * good + this.bad * bad + this.miss * miss;
	}

	// time travel!
	adjustProgress(time) {
		const index = Sunniesnow.Utils.bisectLeft(this.allNotes, note => note.time - time);
		this.unhitNotes = this.allNotes.slice(index);
		for (let i = 0; i < index; i++) {
			this.allNotes[i].clearReleased();
		}
		this.unhitNotes.forEach(note => note.clear());
		this.holdingNotes = [];
		this.timeline[
			Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)
		].events.forEach(note => {
			note.clear();
			note.dryHit(note.time); // this adds note to this.holdingNotes.
		});
		this.perfect = this.combo = this.maxCombo = this.notesCount - this.unhitNotes.length - this.holdingNotes.length;
		this.inaccuracies = new Array(this.combo).fill(0);
		for (let i = 0; i < index; i++) {
			if (!this.holdingNotes.includes(this.allNotes[index - 1 - i])) {
				this.lastJudgedNote = this.allNotes[index - 1 - i];
				this.lastJudgement = 'perfect';
				return;
			}
		}
		this.lastJudgedNote = null;
		this.lastJudgement = null;
	}

	update() {
		const time = Sunniesnow.Music.currentTime;
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
		this.finishIfFinished();
	}

	updateManualPlay(time) {
		this.updateMiss(time);
		this.updateHoldingNotes(time);
		this.updateFinishingHolds(time);
		this.finishIfFinished();
	}

	updateMiss(time) {
		for (let i = 0; i < this.unhitNotes.length;) {
			const note = this.unhitNotes[i];
			if (time < note.time + this.earliestLateBad) {
				break;
			}
			const lateBad = this.judgementWindows[note.type].bad[1];
			if (time > note.time + lateBad) {
				note.edgeHit = true;
				note.edgeJudge('miss');
			} else {
				i++;
			}
		}
	}

	updateHoldingNotes(time) {
		this.holdingNotes.forEach(note => note.updateHoldingIfNeeded(time));
	}

	updateFinishingHolds(time) {
		for (let i = 0; i < this.holdingNotes.length;) {
			const note = this.holdingNotes[i];
			if (time < note.endTime) {
				break;
			}
			if (note.constructor.AUTO_FINISHES_HOLDING || Sunniesnow.game.settings.autoplay) {
				note.release(note.endTime);
			} else {
				i++;
			}
		}
	}

	finishIfFinished() {
		if (this.unhitNotes.length !== 0 || this.holdingNotes.length !== 0) {
			return;
		}
		if (!Sunniesnow.game.settings.pauseFinish || this.lastPause) {
			this.finish();
			return;
		}
		this.lastPause = true;
		Sunniesnow.game.pause();
	}

	touchEnd(touch) {
		if (Sunniesnow.Music.pausing || this.finished) {
			return false;
		}
		const note = touch.note;
		if (note) {
			note.release(touch.end().time);
			return true;
		}
		return false;
	}

	touchMove(touch) {
		if (Sunniesnow.Music.pausing || this.finished) {
			return false;
		}
		const note = touch.note;
		if (note?.holding) {
			note.updateHolding(touch.end().time);
		}
		this.swipeDrags(touch);
		return true;
	}

	touchStart(touch) {
		if (Sunniesnow.Music.pausing || this.finished) {
			return false;
		}
		this.fillCandidateForHolds(touch, this.unhitNotes);
		this.fillCandidateForHolds(touch, this.holdingNotes);
		const time = touch.start().time;
		for (let i = 0; i < this.unhitNotes.length;) {
			let note = this.unhitNotes[i];
			if (time < note.time + this.earliestEarlyBad) {
				return false;
			}
			if (Sunniesnow.Utils.between(time - note.time, ...this.judgementWindows[note.type].bad)) {
				note = this.tryHitNote(note, touch, time);
				if (note?.onlyOnePerTouch()) {
					return true;
				} else if (note) {
					// Do nothing!
					// No i++ because the note is already removed from this.unhitNotes.
				} else {
					i++;
				}
			} else {
				i++;
			}
		}
		return false;
	}

	fillCandidateForHolds(touch, notes) {
		for (let i = 0; i < notes.length; i++) {
			const note = notes[i];
			if (note.type !== 'hold') {
				continue;
			}
			const {x, y, time} = touch.start();
			if (note.isTappableAt(touch, x, y) && Sunniesnow.Utils.between(time - note.time, ...this.judgementWindows.hold.bad)) {
				note.candidateTouches.push(touch);
			}
		}
	}

	distanceAndAngle(x, y, event) {
		if (Sunniesnow.game.settings.scroll) {
			return [Math.abs(x - event.x), Math.atan2(y - event.y, x - event.x)];
		} else {
			return Sunniesnow.Utils.cartesianToPolar(x - event.x, y - event.y);
		}
	}

	// What if a touch can potentially hit different simultaneous notes at this position?
	// Pick the one that is the nearest!
	// However, we should avoid hitting drags as possible.
	// The function hits the most appropriate note and returns the actually hit note.
	tryHitNote(note, touch, time) {
		const {x, y} = touch.start();
		const simultaneousNotes = note.event.simultaneousEvents.map(e => e.levelNote);
		let [distance, angle] = this.distanceAndAngle(x, y, note.event);
		let tappable = note.isTappableAt(touch, x, y);
		for (const newNote of simultaneousNotes) {
			let condition = newNote === note || !newNote || newNote.hitRelativeTime !== null;
			condition ||= newNote.judgementPriority() < note.judgementPriority();
			condition ||= !newNote.isTappableAt(touch, x, y);
			if (condition) {
				continue;
			}
			const [newDistance, newAngle] = this.distanceAndAngle(x, y, newNote.event);
			condition = !tappable;
			condition ||= (!note.onlyOnePerTouch() || newDistance < distance) && newNote.onlyOnePerTouch();
			condition ||= !note.onlyOnePerTouch() && !newNote.onlyOnePerTouch() && newDistance < distance;
			if (note.type === 'flick' && newNote.type === 'flick' && newDistance === distance && Sunniesnow.game.settings.overlappingFlickFix) {
				condition ||= Sunniesnow.Utils.angleDistance(newNote.event.angle, newAngle) < Sunniesnow.Utils.angleDistance(note.event.angle, angle);
			}
			if (condition) {
				note = newNote;
				distance = newDistance;
				angle = newAngle;
				tappable = true;
			}
		}
		if (!tappable) {
			return null;
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
				if (Sunniesnow.game.settings.lyrica5) {
					if (this.apFcIndicator === 'ap' || this.apFcIndicator === 'fc') {
						this.apFcIndicator = 'fcs'; // full combo silver
					}
					this.combo++;
					break;
				}
			case 'miss': // bad also goes here in Lyrica 4
				this.apFcIndicator = '';
				this.combo = 0;
				break;
		}
		this.maxCombo = Math.max(this.maxCombo, this.combo);
		this.lastJudgement = note.judgement;
		this.lastJudgedNote = note;
		this[note.judgement]++;
		if (note.earlyLate) {
			if (note.earlyLate < 0) {
				this.early++;
			} else {
				this.late++;
			}
		}
		if (note.hitRelativeTime !== null && !note.edgeHit) {
			this.inaccuracies.push(note.hitRelativeTime);
		}
	}

	swipeDrags(touch) {
		const {time, x, y} = touch.end();
		for (let i = 0; i < this.unhitNotes.length; i++) {
			const note = this.unhitNotes[i];
			if (!note.swipe) {
				continue;
			}
			if (time < note.time + note.earlyBad()) {
				break;
			}
			if (note.isTappableAt(touch, x, y)) {
				note.swipe(touch);
			}
		}
		for (let i = 0; i < this.holdingNotes.length; i++) {
			const note = this.holdingNotes[i];
			if (!note.swipe) {
				continue;
			}
			if (time < note.endTime + note.earlyBad()) {
				break;
			}
			if (note.isTappableAt(touch, x, y)) {
				note.swipe(touch);
			}
		}
	}
};
