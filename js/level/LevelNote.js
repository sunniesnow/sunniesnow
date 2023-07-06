Sunniesnow.LevelNote = class LevelNote {

	constructor(event) {
		this.event = event;
		event.levelNote = this;
		this.type = event.constructor.TYPE_NAME;
		this.time = event.time;
		this.endTime = event.time + (event.duration || 0);
		this.hitRelativeTime = null;
		this.releaseRelativeTime = null;
		this.judgement = null;
		this.assignedHit = null; // format: {id:, note:, history: [{time:, x:, y:}, ...]}
		this.holding = false;
	}

	// Does the note automatically release itself when time >= this.endTime?
	// It is only false for flicks.
	autoFinishesHolding() {
		return true;
	}

	// Can a finger only hit one of this note?
	// It is only false for drags.
	onlyOnePerTouch() {
		return true;
	}

	// x, y are in chart coordinates
	isTappableAt(x, y) {
		const r = Sunniesnow.Config.radius * Sunniesnow.game.settings.noteHitSize;
		return Math.abs(this.event.x - x) < r && Math.abs(this.event.y - y) < r;
	}

	hit(hitData, time) {
		const relativeTime = (time - this.time) / Sunniesnow.game.settings.gameSpeed;
		if (this.holding) {
			return;
		}
		this.assignedHit = hitData;
		if (hitData && this.onlyOnePerTouch()) {
			hitData.note = this;
		}
		this.hitRelativeTime = relativeTime;
		this.holding = true;
		Sunniesnow.game.level.holdingNotes.push(this);
		Sunniesnow.game.level.holdingNotes.sort((a, b) => a.endTime - b.endTime);
		Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
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
		const relativeTime = (time - this.time) / Sunniesnow.game.settings.gameSpeed;
		if (!this.holding) {
			return;
		}
		this.holding = false;
		this.releaseRelativeTime = relativeTime;
		this.determineJudgement();
		Sunniesnow.game.level.holdingNotes.splice(Sunniesnow.game.level.holdingNotes.indexOf(this), 1);
		Sunniesnow.game.level.onNewJudgement(this);
	}

	miss(relativeTime) {
		this.hitRelativeTime = relativeTime;
		this.releaseRelativeTime = relativeTime;
		this.judgement = 'miss';
		Sunniesnow.game.level.unhitNotes.splice(Sunniesnow.game.level.unhitNotes.indexOf(this), 1);
		Sunniesnow.game.level.onNewJudgement(this);
	}

	updateHolding() {
		// make use of this.assignedHit here in subclasses!
	}
};
