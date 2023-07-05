Sunniesnow.LevelDrag = class LevelDrag extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.highestJudgement = 'miss';
	}

	onlyOnePerTouch() {
		return false;
	}

	refreshJudgement(relativeTime) {
		const newHighest = Sunniesnow.Utils.maxJudgement(
			this.highestJudgement,
			this.getJudgementByRelativeTime(relativeTime)
		);
		if (newHighest !== this.highestJudgement) {
			this.highestJudgement = newHighest;
			this.hitRelativeTime = relativeTime;
		}
	}
};
