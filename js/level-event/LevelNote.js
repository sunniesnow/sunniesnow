Sunniesnow.LevelNote = class LevelNote extends EventTarget {

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
	// It is only false for drags.
	static ONLY_ONE_PER_TOUCH = true;

	// x, y are in chart coordinates
	isTappableAt(touch, x, y) {
		if (touch.wholeScreen) {
			return true;
		}
		const r = Sunniesnow.Config.radius * Sunniesnow.game.settings.noteHitSize;
		return Math.abs(this.event.x - x) < r && Math.abs(this.event.y - y) < r;
	}

	// Hit without processing (see processHit()) or event dispatching
	dryHit(time) {
		this.hitRelativeTime = time - this.time;
		this.holding = true;
		this.determineEarlyLate();
		Sunniesnow.game.level.holdingNotes.push(this);
		Sunniesnow.game.level.holdingNotes.sort((a, b) => a.endTime - b.endTime);
		Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
	}

	hit(touch, time) {
		this.dryHit(time);
		this.processHit(touch, time);
		this.dispatchEvent(new Event('hit'));
	}

	processHit(touch, time) {
		if (!Sunniesnow.game.settings.seWithMusic) {
			this.event.hitSe();
		}
		this.touch = touch;
		if (touch && this.constructor.ONLY_ONE_PER_TOUCH) {
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

	release(time) {
		if (!this.holding) {
			return;
		}
		this.holding = false;
		this.releaseRelativeTime = time - this.time;
		this.determineJudgement();
		if (this.touch && this.constructor.ONLY_ONE_PER_TOUCH) {
			this.touch.note = null;
		}
		this.processRelease(time);
		Sunniesnow.game.level.holdingNotes.splice(Sunniesnow.game.level.holdingNotes.indexOf(this), 1);
		this.dispatchEvent(new Event('release'));
		Sunniesnow.game.level.onNewJudgement(this);
	}

	processRelease(time) {
		if (!Sunniesnow.game.settings.seWithMusic) {
			this.event.releaseSe();
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
			this.dispatchEvent(new Event('release'));
		} else {
			this.hitRelativeTime = edge;
			Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
			if (judgement === 'miss') {
				this.dispatchEvent(new Event('miss'));
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
		return Sunniesnow.Config.appropriateJudgementWindows()[this.type];
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
