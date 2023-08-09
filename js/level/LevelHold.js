Sunniesnow.LevelHold = class LevelHold extends Sunniesnow.LevelNote {
	
	hit(touch, time) {
		super.hit(touch, time);
		this.highestJudgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
	}

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
		this.judgement = Sunniesnow.Utils.minJudgement(this.highestJudgement, judgement);
	}

	updateHolding(time) {
		super.updateHolding(time);
		if (!this.touch || !Sunniesnow.game.settings.lockingHold) {
			return;
		}
		const {x, y, time: t} = this.touch.end();
		if (!this.isTappableAt(this.touch, x, y)) {
			this.release(t);
		}
	}

};
