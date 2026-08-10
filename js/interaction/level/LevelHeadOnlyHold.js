Sunniesnow.LevelHeadOnlyHold = class LevelHeadOnlyHold extends Sunniesnow.LevelNote {
	settingsHitSize() {
		return Sunniesnow.game.settings.noteHitSizeHeadOnlyHold;
	}

	dryHit(time) {
		super.dryHit(time);
		this.highestJudgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
	}

	release(time) {
		if (time < this.endTime) {
			return;
		}
		super.release(time);
	}

	determineJudgement() {
		this.judgement = this.highestJudgement ?? 'miss';
	}
};
