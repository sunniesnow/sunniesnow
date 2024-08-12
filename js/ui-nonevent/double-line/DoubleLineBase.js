Sunniesnow.DoubleLineBase = class DoubleLineBase extends PIXI.Container {

	static FADING_IN_DURATION = 0
	static FADING_OUT_DURATION = 0

	constructor(event1, event2) {
		super();
		this.event1 = event1;
		this.event2 = event2;
		[this.x1, this.y1] = Sunniesnow.Config.chartMapping(event1.x, event1.y);
		[this.x2, this.y2] = Sunniesnow.Config.chartMapping(event2.x, event2.y);
		if (Sunniesnow.game.settings.scroll) {
			this.y1 = this.y2 = Sunniesnow.Config.SCROLL_START_Y;
		}
		this.levelNote1 = event1.levelNote;
		this.levelNote2 = event2.levelNote;
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		this.populate();
	}

	populate() {
	}

	update(relativeTime) {
		this.fadingAlpha = 1; // to be updated in updateActive(); will be used in DoubleLinesBoard
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

	updateState(relativeTime) {
		this.state = this.getStateByRelativeTime(relativeTime);
		this.visible = this.state !== 'ready' && this.state !== 'finished';
	}

	updateFadingIn(progress, relativeTime) {
	}

	updateFadingOut(progress, relativeTime) {
		const fadingProgress = (1 - Sunniesnow.game.settings.fadingStart) / Sunniesnow.game.settings.fadingDuration;
		this.fadingAlpha = Sunniesnow.Utils.clamp(1 - fadingProgress, 0, 1);
		if (Sunniesnow.game.settings.scroll && Sunniesnow.game.settings.autoplay) {
			this.y1 = this.y2 = Sunniesnow.Config.SCROLL_END_Y;
		}
	}

	updateActive(progress, relativeTime) {
		const fadingProgress = (progress - Sunniesnow.game.settings.fadingStart) / Sunniesnow.game.settings.fadingDuration;
		this.fadingAlpha = Sunniesnow.Utils.clamp(1 - fadingProgress, 0, 1);
		if (Sunniesnow.game.settings.scroll) {
			this.y1 = this.y2 = Sunniesnow.Config.scrollY(progress);
		}
	}

	updateHolding(relativeTime) {
		const fadingProgress = (1 - Sunniesnow.game.settings.fadingStart) / Sunniesnow.game.settings.fadingDuration;
		this.fadingAlpha = Sunniesnow.Utils.clamp(1 - fadingProgress, 0, 1);
		if (Sunniesnow.game.settings.scroll && Sunniesnow.game.settings.autoplay) {
			this.y1 = this.y2 = Sunniesnow.Config.SCROLL_END_Y;
		}
	}
};
