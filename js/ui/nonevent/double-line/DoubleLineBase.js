Sunniesnow.DoubleLineBase = class DoubleLineBase extends PIXI.Container {

	static FADING_IN_DURATION = 0
	static FADING_OUT_DURATION = 0

	constructor(event1, event2) {
		super();
		this.event1 = event1;
		this.event2 = event2;
		this.levelNote1 = event1.levelNote;
		this.levelNote2 = event2.levelNote;
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		this.populate();
	}

	populate() {
		this.label = `double-line-${this.event1.id}-${this.event2.id}`;
	}

	update(relativeTime) {
		this.fadingAlpha = 1; // to be updated in updateActive(); will be used in DoubleLinesBoard
		this.updateCoordinates(relativeTime);
		this.updateState(relativeTime);
		switch (this.state) {
			case 'ready':
				// do nothing
				break;
			case 'fadingIn':
				this.updateFadingIn((relativeTime + this.activeDuration) / this.constructor.FADING_IN_DURATION + 1, relativeTime);
				break;
			case 'active':
				this.updateActive(relativeTime / this.activeDuration + 1, relativeTime);
				break;
			case 'holding':
				this.updateHolding(relativeTime);
				break;
			case 'fadingOut':
				const releaseRelativeTime = this.getEffectiveReleaseRelativeTime();
				this.updateFadingOut((relativeTime - releaseRelativeTime) / this.constructor.FADING_OUT_DURATION, relativeTime);
				break;
			case 'finished':
				// do nothing
				break;
		}
	}

	getEffectiveReleaseRelativeTimeOfLevelNote(levelNote) {
		if (levelNote instanceof Sunniesnow.LevelHold) {
			return levelNote.hitRelativeTime;
		} else {
			return levelNote.releaseRelativeTime;
		}
	}

	getEffectiveReleaseRelativeTime() {
		return Math.min(
			this.getEffectiveReleaseRelativeTimeOfLevelNote(this.levelNote1) ?? Infinity,
			this.getEffectiveReleaseRelativeTimeOfLevelNote(this.levelNote2) ?? Infinity
		);
	}

	getStateByRelativeTime(relativeTime) {
		const releaseRelativeTime = this.getEffectiveReleaseRelativeTime();
		if (relativeTime >= releaseRelativeTime + this.constructor.FADING_OUT_DURATION) {
			return 'finished';
		} else if (relativeTime >= releaseRelativeTime) {
			return 'fadingOut';
		} else if (releaseRelativeTime !== Infinity) {
			return 'finished';
		} else if (relativeTime >= 0) {
			return 'holding';
		} else if (relativeTime >= -this.activeDuration) {
			return 'active';
		} else if (relativeTime >= -this.activeDuration - this.constructor.FADING_IN_DURATION) {
			return 'fadingIn';
		} else {
			return 'ready';
		}
	}

	updateCoordinates(relativeTime) {
		if (this.event1.uiEvent?.parent) {
			this.x1 = this.event1.uiEvent.x;
			this.y1 = this.event1.uiEvent.y;
		}
		if (this.event2.uiEvent?.parent) {
			this.x2 = this.event2.uiEvent.x;
			this.y2 = this.event2.uiEvent.y;
		}
	}

	updateState(relativeTime) {
		this.state = this.getStateByRelativeTime(relativeTime);
		this.visible = this.state !== 'ready' && this.state !== 'finished';
	}

	updateFadingIn(progress, relativeTime) {
	}

	updateFadingOut(progress, relativeTime) {
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
	}

	updateActive(progress, relativeTime) {
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha(progress, relativeTime);
	}

	updateHolding(relativeTime) {
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
	}
};
