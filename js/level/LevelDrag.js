Sunniesnow.LevelDrag = class LevelDrag extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.highestJudgement = Sunniesnow.game.settings.autoplay ? 'perfect' : 'miss';
	}

	static ONLY_ONE_PER_TOUCH = false
	static AUTO_FINISHES_HOLDING = false

	hit(touch, time) {
		super.hit(touch, time);
		this.swipe(touch);
		this.release(time);
	}

	swipe(touch) {
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
		}
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
