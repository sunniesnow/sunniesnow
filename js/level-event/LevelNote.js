Sunniesnow.LevelNote = class LevelNote extends EventTarget {

	static NoteEvent = class NoteEvent extends Event {
		constructor(type, levelNote) {
			super(type);
			this.levelNote = levelNote;
		}
	}

	constructor(event) {
		super();
		this.event = event;
		this.type = event.constructor.TYPE_NAME;
		this.time = event.time + Sunniesnow.game.settings.offset;
		this.endTime = this.time + (event.duration || 0);
		this.clear();
	}

	clear() {
		this.hitRelativeTime = null;
		this.releaseRelativeTime = null;
		this.judgement = null;
		this.earlyLate = null;
		this.touch = null;
		this.holding = false;
		this.needsToUpdateHolding = true;
		this.swiped = false;
		this.isEdgeHit = false;
	}

	// Only used for progress adjustment
	clearReleased() {
		this.hitRelativeTime = 0;
		this.releaseRelativeTime = this.endTime - this.time;
		this.judgement = 'perfect';
		this.earlyLate = 0;
		this.touch = null;
		this.holding = false;
		this.needsToUpdateHolding = true;
	}

	// Does the note automatically release itself when time >= this.endTime?
	// If false, the note manages its release in its updateHolding() method.
	// It is only false for flicks and drags.
	static AUTO_FINISHES_HOLDING = true;

	// Can a finger only hit one of this note?
	// It is only false for drags in Lyrica 4.
	onlyOnePerTouch() {
		return true;
	}

	// This controls judgement priority when different notes are simultaneous.
	// For simultaneous notes with the same priority, the one closer to the touch point is judged.
	judgementPriority() {
		return 0;
	}

	// x, y are in chart coordinates
	isTappableAt(touch, x, y) {
		if (touch.wholeScreen) {
			return true;
		}
		const r = Sunniesnow.Config.RADIUS * Sunniesnow.game.settings.noteHitSize * this.event.size;
		const distance = Sunniesnow.game.settings.scroll ? Math.abs(this.event.x - x) : Math.hypot(this.event.x - x, this.event.y - y);
		return distance < r;
	}

	// Hit without processing (see processHit()) or event dispatching
	dryHit(time) {
		this.hitRelativeTime = time - this.time;
		this.holding = true;
		this.determineEarlyLate();
		Sunniesnow.game.level.holdingNotes.push(this);
		Sunniesnow.game.level.holdingNotes.sort((a, b) => a.endTime - b.endTime);
		const index = Sunniesnow.game.level.unhitNotes.indexOf(this);
		if (index >= 0) { // this condition may fail when this method is called in Level.prototype.adjustProgress().
			Sunniesnow.game.level.unhitNotes.splice(index, 1);
		}
	}

	hit(touch, time) {
		this.dryHit(time);
		this.processHit(touch, time);
		this.newEvent('hit');
	}

	processHit(touch, time) {
		if (!Sunniesnow.game.settings.seWithMusic) {
			this.event.hitSe();
		}
		if (!Sunniesnow.game.settings.vibrationWithMusic && !this.swiped) {
			Sunniesnow.VibrationManager.vibrateOnce(this.event.vibrationTime());
		}
		this.touch = touch;
		if (touch && !this.swiped) {
			touch.note = this;
		}
	}

	determineEarlyLate() {
		this.earlyLate = 0;
		if (!Sunniesnow.Utils.between(this.hitRelativeTime, ...this.judgementWindows().perfect)) {
			this.earlyLate = Math.sign(this.hitRelativeTime);
		}
	}

	determineJudgement() {
		this.judgement = this.getJudgementByRelativeTime(this.releaseRelativeTime);
	}

	getJudgementByRelativeTime(relativeTime) {
		const judgementWindows = this.judgementWindows();
		if (Sunniesnow.Utils.between(relativeTime, ...judgementWindows.perfect)) {
			return 'perfect';
		} else if (Sunniesnow.Utils.between(relativeTime, ...judgementWindows.good)) {
			return 'good';
		} else if (Sunniesnow.Utils.between(relativeTime, ...judgementWindows.bad)) {
			return 'bad';
		} else {
			return 'miss';
		}
	}

	newEvent(type) {
		const event = new this.constructor.NoteEvent(type, this);
		this.dispatchEvent(event);
		Sunniesnow.game.level.dispatchEvent(event);
	}

	release(time) {
		if (!this.holding) {
			return;
		}
		this.holding = false;
		this.releaseRelativeTime = time - this.time;
		this.determineJudgement();
		if (this.touch && this.onlyOnePerTouch()) {
			this.touch.note = null;
		}
		this.processRelease(time);
		Sunniesnow.game.level.holdingNotes.splice(Sunniesnow.game.level.holdingNotes.indexOf(this), 1);
		this.newEvent('release');
		Sunniesnow.game.level.onNewJudgement(this);
	}

	processRelease(time) {
		if (!Sunniesnow.game.settings.seWithMusic) {
			this.event.releaseSe();
		}
		if (!Sunniesnow.game.settings.vibrationWithMusic && !this.onlyOnePerTouch()) {
			Sunniesnow.VibrationManager.vibrateOnce(this.event.vibrationTime());
		}
	}

	edgeJudge(judgement) {
		const edge = this.getEarliestLate(judgement);
		this.releaseRelativeTime = edge;
		this.judgement = judgement;
		if (this.holding) {
			this.holding = false;
			this.processRelease(this.time + edge);
			Sunniesnow.game.level.holdingNotes.splice(Sunniesnow.game.level.holdingNotes.indexOf(this), 1);
			this.newEvent('release');
		} else {
			this.hitRelativeTime = edge;
			Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
			if (judgement === 'miss') {
				this.newEvent('miss');
			}
		}
		Sunniesnow.game.level.onNewJudgement(this);
	}

	getEarliestLate(judgement) {
		switch (judgement) {
			case 'perfect':
				return 0;
			case 'good':
				return this.latePerfect();
			case 'bad':
				return this.lateGood();
			case 'miss':
				return this.lateBad();
		}
	}

	updateHolding(time) {
		this.needsToUpdateHolding = false;
		// make use of this.touch here in subclasses!
	}

	updateHoldingIfNeeded(time) {
		if (this.needsToUpdateHolding) {
			this.updateHolding(time);
		}
		this.needsToUpdateHolding = true;
	}

	judgementWindows() {
		return Sunniesnow.Config.JUDGEMENT_WINDOWS[this.type];
	}

	earlyPerfect() {
		return this.judgementWindows().perfect[0];
	}

	latePerfect() {
		return this.judgementWindows().perfect[1];
	}

	earlyGood() {
		return this.judgementWindows().good[0];
	}

	lateGood() {
		return this.judgementWindows().good[1];
	}

	earlyBad() {
		return this.judgementWindows().bad[0];
	}

	lateBad() {
		return this.judgementWindows().bad[1];
	}

};
