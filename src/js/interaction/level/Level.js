import Sunniesnow from '../../Sunniesnow.js';

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
			this.judgementWindows.hold.bad[1],
			this.judgementWindows.dragFlick.bad[1],
			this.judgementWindows.headOnlyHold.bad[1],
		);
		[this.earliestEarlyBad, this.latestEarlyBad] = Sunniesnow.Utils.minmax(
			this.judgementWindows.tap.bad[0],
			this.judgementWindows.drag.bad[0],
			this.judgementWindows.flick.bad[0],
			this.judgementWindows.hold.bad[0],
			this.judgementWindows.dragFlick.bad[0],
			this.judgementWindows.headOnlyHold.bad[0],
		);
	}

	initializeNoteStores() {
		this.unhitNotes = [];
		for (const event of Sunniesnow.game.chart.events) {
			if (event instanceof Sunniesnow.Note && !event.fake) {
				this.unhitNotes.push(event.newLevelNote());
			}
		}
		if (this.unhitNotes.length === 0) {
			// should never reach here because of Chart.checkNoNotes
			throw new Error('No notes in the chart');
		}
		this.unhitNotes.sort((a, b) => a.time - b.time || b.judgementPriority() - a.judgementPriority());
		this.hash = Sunniesnow.Utils.objectHash(this.unhitNotes.map(n => n.toObject()), 'base64');
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
		this.apFcIndicator = 'ap'; // possible values: 'ap', 'fc', 'fcs', ''
	}

	addTouchListeners() {
		Sunniesnow.TouchManager.addStartListener(
			this.touchStartListener = touch => {
				// Must call touchMove immediately after touchStart for swiping drags.
				// Consider the following sequence of notes with lyrica-5 judgement: tap1, drag1, tap2.
				// If there are two touchstart events very close in time, then tap2 will not be judged
				// if touchMove is not immediately called for each touchstart event.
				const result = this.touchStart(touch);
				this.touchMove(touch);
				return result;
			},
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
		this.swipingFillCandidateForHolds(touch);
		return true;
	}

	touchStart(touch) {
		if (Sunniesnow.Music.pausing || this.finished) {
			return false;
		}
		if (this.touchScreensTapping(touch)) {
			return true;
		}
		this.tappingFillCandidateForHolds(touch);
		if (this.holdScreensTapping(touch)) {
			return true;
		}
		const notes = this.getHitNotes(touch);
		const time = touch.start().time;
		for (const note of notes) {
			note.hit(touch, time);
			if (note.onlyOnePerTouch()) {
				return true;
			}
		}
		return false;
	}

	// array of all hittable notes sorted by judgement priority
	getHitNotes(touch) {
		const {x, y, time} = touch.start();
		// Only notes in hittableNotes can be hit.
		// Build this array first, and then sort by judgement priority.
		const hittableNotes = [];
		for (const note of this.unhitNotes) {
			if (time < note.time + this.earliestEarlyBad) {
				break;
			}
			if (note.isHittableBy(touch)) {
				hittableNotes.push(note);
			}
		}
		const reducedTimes = new Map();
		let lastReducedTime = -Infinity;
		for (const note of hittableNotes) {
			if (note.time - lastReducedTime > Sunniesnow.game.settings.samePriorityTimeWindow) {
				lastReducedTime = note.time;
			}
			reducedTimes.set(note, lastReducedTime);
		}
		const reducedAngleDifferences = new Map();
		if (Sunniesnow.game.settings.overlappingFlickFix) {
			// This algorithm makes sure that if two flick-like notes originally have adjacent priorities,
			// then the one with the smaller angle difference to the touch point has higher priority.
			let lastIndex = 0;
			for (const note of hittableNotes) {
				if (note.isFlickLike()) {
					const [distance, angle] = this.distanceAndAngle(x, y, note.event);
					reducedAngleDifferences.set(note, [lastIndex, Sunniesnow.Utils.angleDistance(note.event.angles[0], angle)]);
				} else {
					lastIndex++;
					reducedAngleDifferences.set(note, [lastIndex, -Infinity]);
				}
			}
		}
		Sunniesnow.Utils.sortBy(hittableNotes, note => {
			const [distance, angle] = this.distanceAndAngle(x, y, note.event);
			const keys = [
				!note.isHittableBy(touch, note.settingsPriorHitSize()),
				// Use reduced time to take care of same-priority-time-window.
				reducedTimes.get(note),
				// drag and drag-flick notes have lower priority in lyrica-5.
				-note.judgementPriority(),
				// Closer notes have higher priority.
				// Caveat: this is sensitive to floating-point errors.
				distance,
			];
			// Take care of overlapping-flick-fix.
			if (note.isFlickLike() && Sunniesnow.game.settings.overlappingFlickFix) {
				keys.push(...reducedAngleDifferences.get(note));
			}
			return keys;
		});
		return hittableNotes;
	}

	tappingFillCandidateForHolds(touch) {
		const {x, y, time} = touch.start();
		for (const note of this.unhitNotes) {
			if (note.type !== 'hold') {
				continue;
			}
			if (note.time - this.unhitNotes[0].time > Sunniesnow.game.settings.samePriorityTimeWindow) {
				break;
			}
			if (note.isTappableAt(touch, x, y) && Sunniesnow.Utils.between(time - note.time, ...this.judgementWindows.hold.bad)) {
				note.candidateTouches.push(touch);
			}
		}
		for (const note of this.holdingNotes) {
			if (note.type !== 'hold') {
				continue;
			}
			let condition = note.isTappableAt(touch, x, y) && Sunniesnow.Utils.between(time - note.time, ...this.judgementWindows.hold.bad);
			condition ||= note.isTappableAt(touch, x, y, Sunniesnow.game.settings.holdSwitchTapSize);
			condition && note.candidateTouches.push(touch);
		}
	}

	swipingFillCandidateForHolds(touch) {
		const {x, y} = touch.end();
		for (const note of this.holdingNotes) {
			if (note.type !== 'hold') {
				continue;
			}
			note.isTappableAt(touch, x, y, Sunniesnow.game.settings.holdSwitchSwipeSize) && note.candidateTouches.push(touch);
		}
	}

	touchScreensTapping(touch) {
		if (Sunniesnow.game.settings.touchScreeningDistance <= 0 || touch.type !== 'touch') {
			return false;
		}
		const {x, y} = touch.start();
		for (const otherTouch of Sunniesnow.TouchManager.touches.values()) {
			if (otherTouch === touch || otherTouch.type !== 'touch') {
				continue;
			}
			const {x: otherX, y: otherY} = otherTouch.end();
			if (Sunniesnow.Utils.distance(x, y, otherX, otherY) < Sunniesnow.game.settings.touchScreeningDistance) {
				return true;
			}
		}
		return false;
	}

	holdScreensTapping(touch) {
		if (touch.wholeScreen) {
			return false;
		}
		const {x, y} = touch.start();
		return this.holdingNotes.some(
			note => note.type === 'hold' && note.isTappableAt(touch, x, y, Sunniesnow.game.settings.holdScreeningSize)
		);
	}

	distanceAndAngle(x, y, event) {
		if (Sunniesnow.game.settings.scroll) {
			return [Math.abs(x - event.x), Math.atan2(y - event.y, x - event.x)];
		} else {
			return Sunniesnow.Utils.cartesianToPolar(x - event.x, y - event.y);
		}
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

	notesHash(notes, format = 'hex') {
		const objects = notes.map(n => n.toObject());
		const startTime = objects[0].time;
		objects.forEach(object => {
			object.time -= startTime;
			object.endTime -= startTime;
		});
		return Sunniesnow.Utils.objectHash(objects, format);
	}
};
