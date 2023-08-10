Sunniesnow.LevelNote = class LevelNote extends EventTarget {

	constructor(event) {
		super();
		this.event = event;
		this.type = event.constructor.TYPE_NAME;
		this.time = event.time + Sunniesnow.game.settings.offset;
		this.endTime = this.time + (event.duration || 0);
		this.hitRelativeTime = null;
		this.releaseRelativeTime = null;
		this.judgement = null;
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

	hit(touch, time) {
		this.hitRelativeTime = time - this.time;
		this.holding = true;
		this.processHit(touch, time);
		Sunniesnow.game.level.holdingNotes.push(this);
		Sunniesnow.game.level.holdingNotes.sort((a, b) => a.endTime - b.endTime);
		Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
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

	determineJudgement() {
		this.judgement = this.getJudgementByRelativeTime(this.releaseRelativeTime);
	}

	getJudgementByRelativeTime(relativeTime) {
		const judgementWindows = Sunniesnow.Config.judgementWindows[Sunniesnow.game.settings.judgementWindows][this.type];
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
		this.processRelease(time);
		Sunniesnow.game.level.holdingNotes.splice(Sunniesnow.game.level.holdingNotes.indexOf(this), 1);
		Sunniesnow.game.level.onNewJudgement(this);
		this.dispatchEvent(new Event('release'));
	}

	processRelease(time) {
		if (!Sunniesnow.game.settings.seWithMusic) {
			this.event.releaseSe();
		}
	}

	edgeJudge(judgement) {
		const edge = this.getEarliestLate(judgement);
		if (this.holding) {
			this.processRelease(this.time + edge);
			this.holding = false;
			Sunniesnow.game.level.holdingNotes.splice(Sunniesnow.game.level.holdingNotes.indexOf(this), 1);
			this.dispatchEvent(new Event('release'));
		} else {
			this.hitRelativeTime = edge;
			Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
		}
		this.releaseRelativeTime = edge;
		this.judgement = judgement;
		Sunniesnow.game.level.onNewJudgement(this);
	}

	getEarliestLate(judgement) {
		const judgementWindows = Sunniesnow.Config.judgementWindows[Sunniesnow.game.settings.judgementWindows][this.type];
		switch (judgement) {
			case 'perfect':
				return 0;
			case 'good':
				return judgementWindows.perfect[1];
			case 'bad':
				return judgementWindows.good[1];
			case 'miss':
				return judgementWindows.bad[1];
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
};
