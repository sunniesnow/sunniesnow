Sunniesnow.LevelHold = class LevelHold extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.candidateTouches = [];
	}
	
	dryHit(time) {
		super.dryHit(time);
		this.highestJudgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
	}

	determineJudgement() {
		let judgement;
		const ratio = this.releaseRelativeTime / this.event.duration;
		const judgementWindows = this.endJudgementWindows();
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

	endJudgementWindows() {
		return Sunniesnow.Config.appropriateJudgementWindows().holdEnd;
	}

	release(time) {
		if (time >= this.endTime) {
			return super.release(time);
		}
		if (!this.holding || !this.touch) {
			return;
		}
		for (let i = 0; i < this.candidateTouches.length;) {
			const touch = this.candidateTouches[i];
			if (touch.finished) {
				this.candidateTouches.splice(i, 1);
				continue;
			}
			if (!touch.note) {
				touch.note = this;
				this.touch = touch;
				return;
			}
			i++;
		}
		super.release(time);
	}

};
