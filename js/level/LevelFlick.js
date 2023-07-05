Sunniesnow.LevelFlick = class LevelFlick extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.badFlick = false;
	}

	autoFinishesHolding() {
		return false;
	}

	determineJudgement() {
		if (this.badFlick) {
			this.judgement = 'bad';
		} else {
			this.judgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
		}
	}

	// the distance of touch spot moving to be regarded as a flick
	minFlickDistance() {
		return Sunniesnow.Config.radius / 2;
	}
	maxFlickDistance() {
		return Sunniesnow.Config.radius;
	}
	
	// the angle range
	angleRange() {
		return [-Math.PI / 4, Math.PI / 4];
	}

	// the time of touch spot moving to be regarded as a flick
	thresholdFlickDuration() {
		return Sunniesnow.Config.judgementWindows[Sunniesnow.game.settings.judgementWindows].flick.bad[1];
	}

	updateHolding() {
		if (!this.assignedHit) {
			return;
		}
		const history = this.assignedHit.history;
		const distance = Sunniesnow.Utils.distance(
			history[0].x, history[0].y,
			history[history.length - 1].x, history[history.length - 1].y
		);
		const timeElapsed = history[history.length - 1].time - history[0].time;
		if (timeElapsed > this.thresholdFlickDuration()) { // too slow
			console.log('too slow', timeElapsed, history);
			this.badFlick = true;
			this.release(this.hitRelativeTime + this.thresholdFlickDuration());
			return;
		}
		const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(
			history[history.length - 1].x - history[0].x,
			history[history.length - 1].y - history[0].y
		);
		if (rho >= this.maxFlickDistance()) {
			const angle = Sunniesnow.Utils.quo(phi - this.event.angle + Math.PI, Math.PI*2)[1] - Math.PI;
			if (!Sunniesnow.Utils.between(angle, ...this.angleRange())) { // wrong direction
				console.log('wrong direction', angle, history);
				this.badFlick = true;
			}
			this.release(history[history.length - 1].time - this.time);
		}
	}

	release(relativeTime) {
		if (!this.holding) {
			return;
		}
		if (this.assignedHit) {
			const history = this.assignedHit.history;
			const distance = Sunniesnow.Utils.distance(
				history[0].x, history[0].y,
				history[history.length - 1].x, history[history.length - 1].y
			);
			if (distance < this.minFlickDistance()) { // not enough distance
				console.log('not enough distance', distance, history);
				this.badFlick = true;
			}
		}
		super.release(relativeTime);
	}
};
