Sunniesnow.LevelHold = class LevelHold extends Sunniesnow.LevelNote {
	determineJudgement() {
		let judgement;
		const ratio = this.releaseRelativeTime / this.event.duration;
		const judgementWindows = Sunniesnow.Config.judgementWindows[Sunniesnow.game.settings.judgementWindows].holdEnd;
		if (ratio >= judgementWindows.perfect) {
			judgement = 'perfect';
		} else if (ratio >= judgementWindows.good) {
			judgement = 'good';
		} else if (ratio >= judgementWindows.bad) {
			judgement = 'bad';
		} else {
			judgement = 'miss';
		}
		this.judgement = Sunniesnow.Utils.minJudgement(
			this.getJudgementByRelativeTime(this.hitRelativeTime),
			judgement
		);
	}
};
