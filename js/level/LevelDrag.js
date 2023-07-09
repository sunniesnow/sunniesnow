Sunniesnow.LevelDrag = class LevelDrag extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.highestJudgement = Sunniesnow.game.settings.autoplay ? 'perfect' : 'miss';
	}

	static ONLY_ONE_PER_TOUCH = false

	refreshJudgement(time) {
		const relativeTime = time - this.time;
		const newHighest = Sunniesnow.Utils.maxJudgement(
			this.highestJudgement,
			this.getJudgementByRelativeTime(relativeTime)
		);
		if (newHighest !== this.highestJudgement) {
			this.highestJudgement = newHighest;
			this.hitRelativeTime = relativeTime;
		}
	}

	determineJudgement() {
		this.judgement = this.highestJudgement;
	}

};
