Sunniesnow.LevelDrag = class LevelDrag extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.highestJudgement = Sunniesnow.game.settings.autoplay ? 'perfect' : 'miss';
	}

	static AUTO_FINISHES_HOLDING = false

	onlyOnePerTouch() {
		return Sunniesnow.game.settings.lyrica5;
	}

	// If a tap and a drag are simultaneous, the tap is judged first.
	judgementPriority() {
		return Sunniesnow.game.settings.lyrica5 ? -1 : super.judgementPriority();
	}

	hit(touch, time) {
		super.hit(touch, time);
		if (!touch) {
			return;
		}
		this.touchedBy(touch);
		this.release(time);
	}

	touchedBy(touch) {
		const time = touch.end().time;
		const relativeTime = time - this.time;
		if (!this.holding) {
			super.hit(touch, time);
		}
		const newHighest = Sunniesnow.Utils.maxJudgement(
			this.highestJudgement,
			this.getJudgementByRelativeTime(relativeTime)
		);
		if (newHighest !== this.highestJudgement) {
			this.highestJudgement = newHighest;
			this.hitRelativeTime = relativeTime;
			this.touch = touch;
			this.determineEarlyLate();
		}
	}

	swipe(touch) {
		this.swiped = true;
		this.touchedBy(touch);
	}

	determineJudgement() {
		this.judgement = this.highestJudgement;
	}

	updateHolding(time) {
		super.updateHolding(time);
		if (time - this.time > this.getEarliestLate(this.highestJudgement)) {
			this.edgeJudge(this.highestJudgement);
		}
	}

};
