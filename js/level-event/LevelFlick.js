Sunniesnow.LevelFlick = class LevelFlick extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.slow = false;
	}

	static AUTO_FINISHES_HOLDING = false

	determineJudgement() {
		if (!this.touch || this.touch.wholeScreen) {
			super.determineJudgement();
			return;
		}
		const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(...this.touch.totalMovement());
		if (rho < this.minFlickDistance()) { // too short
			this.judgement = this.slow ? 'miss' : 'bad';
			return;
		}
		const angle = Sunniesnow.Utils.angleDifference(phi, this.event.angle);
		if (!Sunniesnow.Utils.between(angle, ...this.angleRange())) { // wrong direction
			this.judgement = 'bad';
			return;
		}
		this.judgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
	}

	// the distance of touch spot moving to be regarded as a flick
	minFlickDistance() {
		return Sunniesnow.Config.radius * Sunniesnow.game.settings.minFlickDistance;
	}
	maxFlickDistance() {
		return Sunniesnow.Config.radius * Sunniesnow.game.settings.maxFlickDistance;
	}
	
	// the angle range
	angleRange() {
		return [-Sunniesnow.game.settings.flickAngleRange, Sunniesnow.game.settings.flickAngleRange];
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
		if (time - this.time > this.lateBad()) {
			this.slow = true;
			this.release(this.lateBad());
			return;
		}
		const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(...this.touch.totalMovement());
		let condition = rho >= this.minFlickDistance();
		if (condition) {
			const angle = Sunniesnow.Utils.angleDifference(phi, this.event.angle);
			condition = Sunniesnow.Utils.between(angle, ...this.angleRange());
		}
		condition ||= rho >= this.maxFlickDistance();
		if (condition) {
			this.release(this.touch.end().time);
		}
	}

};
