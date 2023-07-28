Sunniesnow.LevelFlick = class LevelFlick extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.badFlick = false;
	}

	static AUTO_FINISHES_HOLDING = false

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

	hit(touch, time) {
		super.hit(touch, time);
		if (touch?.wholeScreen) {
			this.release(time);
		}
	}

	updateHolding(time) {
		super.updateHolding(time);
		if (!this.touch) {
			return;
		}
		if (this.touch.timeElapsed() > this.thresholdFlickDuration()) { // too slow
			this.badFlick = true;
			this.release(this.time + this.hitRelativeTime + this.thresholdFlickDuration());
			return;
		}
		const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(...this.touch.totalMovement());
		if (rho >= this.maxFlickDistance()) {
			const angle = Sunniesnow.Utils.quo(phi - this.event.angle + Math.PI, Math.PI*2)[1] - Math.PI;
			if (!Sunniesnow.Utils.between(angle, ...this.angleRange())) { // wrong direction
				this.badFlick = true;
			}
			this.release(this.touch.end().time);
		}
	}

	release(time) {
		if (!this.holding) {
			return;
		}
		if (this.touch && !this.touch.wholeScreen && this.touch.totalDisplacement() < this.minFlickDistance()) { // not enough distance
			this.badFlick = true;
		}
		super.release(time);
	}
};
