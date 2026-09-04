Sunniesnow.LevelHold = class LevelHold extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.candidateTouches = [];
	}

	settingsHitSize() {
		return Sunniesnow.game.settings.noteHitSizeHold;
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
		if (!this.touch) {
			this.prereleaseTime != null && this.release(time);
			return;
		}
		const {x, y, time: t} = this.touch.end();
		if (!this.isTappableAt(this.touch, x, y, Sunniesnow.game.settings.holdKeepSize)) {
			this.release(t);
		}
	}

	endJudgementWindows() {
		return Sunniesnow.Config.JUDGEMENT_WINDOWS.holdEnd;
	}

	release(time) {
		if (time >= this.endTime) {
			return super.release(this.endTime);
		}
		if (!this.holding || this.acceptCandidateTouch()) {
			return;
		}
		this.prereleaseTime ??= time;
		time - this.prereleaseTime >= Sunniesnow.game.settings.holdReleaseLeniency && super.release(time);
	}

	acceptCandidateTouch() {
		for (let i = 0; i < this.candidateTouches.length;) {
			const touch = this.candidateTouches[i];
			if (touch.finished) {
				this.candidateTouches.splice(i, 1);
				continue;
			}
			if (!touch.note) {
				touch.note = this;
				this.prereleaseTime = null;
				return this.touch = touch;
			}
			i++;
		}
		return this.touch = null;
	}

};
