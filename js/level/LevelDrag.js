Sunniesnow.LevelDrag = class LevelDrag extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.highestJudgement = 'miss';
	}

	onlyOnePerTouch() {
		return false;
	}

	refreshJudgement(time) {
		const relativeTime = (time - this.time) / Sunniesnow.game.settings.gameSpeed;
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
