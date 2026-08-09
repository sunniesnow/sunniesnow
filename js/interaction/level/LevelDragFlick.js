Sunniesnow.LevelDragFlick = class LevelDragFlick extends Sunniesnow.LevelNote {

	constructor(event) {
		super(event);
		this.designatedTouch = null;
		// only used when designatedTouch is not null
		this.slow = false;
		this.trackingTouches = new Set();
		// only used when designatedTouch is null
		this.highestJudgement = Sunniesnow.game.settings.autoplay ? 'perfect' : 'miss';
	}

	static AUTO_FINISHES_HOLDING = false

	onlyOnePerTouch() {
		return Sunniesnow.game.settings.lyrica5;
	}

	// If a tap and a drag are simultaneous, the tap is judged first.
	judgementPriority() {
		return Sunniesnow.game.settings.lyrica5 ? -1 : super.judgementPriority();
	}

	isFlickLike() {
		return true;
	}

	determineJudgement() {
		if (this.designatedTouch) {
			this.determineJudgementWithDesignatedTouch();
		} else {
			this.determineJudgementWithTrackingTouches();
		}
	}

	determineJudgementWithTrackingTouches() {
		this.judgement = this.highestJudgement;
	}

	determineJudgementWithDesignatedTouch() {
		if (this.slow) {
			this.judgement = 'miss';
			return;
		}
		const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(...this.designatedTouch.totalMovement());
		if (this.minFlickDistance() > 0) {
			for (const angle of this.event.angles) {
				if (Sunniesnow.Utils.between(Sunniesnow.Utils.angleDifference(phi, angle), ...this.angleRange())) {
					this.judgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
					return;
				}
			}
			this.judgement = 'bad'; // wrong direction
		} else {
			this.judgement = this.getJudgementByRelativeTime(this.hitRelativeTime);
		}
	}

	// the distance of touch spot moving to be regarded as a flick
	minFlickDistance() {
		return Sunniesnow.Config.RADIUS * Sunniesnow.game.settings.minFlickDistance;
	}
	// only used when designatedTouch is not null
	maxFlickDistance() {
		return Sunniesnow.Config.RADIUS * Sunniesnow.game.settings.maxFlickDistance;
	}

	// the angle range
	angleRange() {
		return [-Sunniesnow.game.settings.flickAngleRange, Sunniesnow.game.settings.flickAngleRange];
	}

	hit(touch, time) {
		this.designatedTouch = touch;
		super.hit(touch, time);
		if (!touch) {
			return;
		}
		this.touchedBy(touch);
		if (touch.wholeScreen) {
			this.release(time);
		}
	}

	release(time) {
		if (Sunniesnow.game.settings.noEarlyDrag && time < this.time) {
			return;
		}
		super.release(time);
	}

	touchedBy(touch) {
		this.trackingTouches.add(touch);
	}

	swipe(touch) {
		if (this.designatedTouch) {
			return;
		}
		this.swiped = true;
		this.edgeHit = true;
		this.touchedBy(touch);
		if (this.highestJudgement === 'perfect') {
			return;
		}
		this.checkFlick(touch);
	}

	updateHolding(time) {
		super.updateHolding(time);
		if (time - this.time > this.lateBad()) {
			this.slow = true;
			this.release(this.time + this.lateBad());
			return;
		}
		if (this.designatedTouch) {
			this.updateHoldingWithDesignatedTouch(time);
		} else {
			this.updateHoldingWithTrackingTouches(time);
		}
	}

	updateHoldingWithDesignatedTouch(time) {
		const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(...this.designatedTouch.totalMovement());
		if (this.minFlickDistance() === 0) {
			this.release(this.designatedTouch.end().time);
			return;
		}
		let condition = rho >= this.minFlickDistance();
		if (condition) {
			condition = false;
			for (const angle of this.event.angles) {
				if (Sunniesnow.Utils.between(Sunniesnow.Utils.angleDifference(phi, angle), ...this.angleRange())) {
					condition = true;
					break;
				}
			}
		}
		condition ||= rho >= this.maxFlickDistance();
		if (condition) {
			this.release(this.designatedTouch.end().time);
		}
	}

	updateHoldingWithTrackingTouches(time) {
		if (time - this.time > this.getEarliestLate(this.highestJudgement)) {
			this.edgeJudge(this.highestJudgement);
			return;
		}
		if (this.highestJudgement === 'perfect') {
			return;
		}
		for (const touch of this.trackingTouches) {
			this.checkFlick(touch);
		}
	}

	checkFlick(touch) {
		const {x, y} = touch.end();
		for (let i = touch.history.length - 1; i >= 0; i--) {
			const {x: lastX, y: lastY, time: lastTime} = touch.history[i];
			if (!this.isTappableAt(touch, lastX, lastY)) {
				continue;
			}
			const lastRelativeTime = lastTime - this.time;
			if (lastRelativeTime < this.earlyBad()) {
				break;
			}
			if (this.highestJudgement === 'good') {
				if (lastRelativeTime > this.lateGood()) {
					continue;
				} else if (lastRelativeTime < this.earlyGood()) {
					break;
				}
			}
			const [rho, phi] = Sunniesnow.Utils.cartesianToPolar(x - lastX, y - lastY);
			if (rho < this.minFlickDistance()) {
				continue;
			}
			if (this.highestJudgement === 'miss') {
				this.highestJudgement = 'bad';
			}
			if (this.minFlickDistance() !== 0 && !this.event.angles.some(angle => Sunniesnow.Utils.between(Sunniesnow.Utils.angleDifference(phi, angle), ...this.angleRange()))) {
				continue;
			}
			if (!this.holding) {
				super.hit(touch, lastTime);
			}
			const newHighest = Sunniesnow.Utils.maxJudgement(
				this.highestJudgement,
				this.getJudgementByRelativeTime(lastRelativeTime)
			);
			if (newHighest !== this.highestJudgement) {
				this.highestJudgement = newHighest;
				this.hitRelativeTime = lastRelativeTime;
				this.touch = touch;
				this.determineEarlyLate();
			}
		}
	}

};
