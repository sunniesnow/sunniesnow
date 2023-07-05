Sunniesnow.UiEvent = class UiEvent extends PIXI.Container {

	static FADING_IN_DURATION = 0
	static FADING_OUT_DURATION = 0

	// Load assets in this method to avoid loading assets during game.
	// To be overridden in subclasses.
	static initialize() {
	}

	constructor(event) {
		super();
		this.event = event;
		this.activeDuration = 0;
		// For notes and background notes:
		// ready -> fadingIn -> active -> holding -> fadingOut -> finished
		// The holding state is never actually reached for non-hold (bg) notes.
		// For background geometries:
		// ready -> fadingIn -> holding -> fadingOut -> finished
		this.state = 'ready';
		this.visible = false;
		this.populate();
	}

	populate() {
	}

	update(relativeTime) {
		this.updateState(relativeTime);
		switch (this.state) {
			case 'ready':
				// do nothing
				break;
			case 'fadingIn':
				this.updateFadingIn(relativeTime + this.activeDuration + this.constructor.FADING_IN_DURATION);
				break;
			case 'active':
				this.updateActive(relativeTime / this.activeDuration + 1);
				break;
			case 'holding':
				this.updateHolding(relativeTime / (this.event.duration / Sunniesnow.game.settings.gameSpeed));
				break;
			case 'fadingOut':
				this.updateFadingOut(relativeTime - this.levelNote.releaseRelativeTime);
				break;
			case 'finished':
				// do nothing
				break;
		}
	}

	getStateByRelativeTime(relativeTime) {
		if (this.levelNote) {
			if (this.levelNote.hitRelativeTime !== null) {
				if (this.levelNote.releaseRelativeTime !== null) {
					if (relativeTime >= this.levelNote.releaseRelativeTime + this.constructor.FADING_OUT_DURATION) {
						return 'finished';
					} else {
						return 'fadingOut';
					}
				} else if (this.levelNote.event.duration > 0) {
					return 'holding';
				} else {
					return 'active';
				}
			}
		} else {
			const releaseRelativeTime = (this.event.duration || 0) / Sunniesnow.game.settings.gameSpeed;
			if (relativeTime >= releaseRelativeTime + this.constructor.FADING_OUT_DURATION) {
				return 'finished';
			} else if (relativeTime >= releaseRelativeTime) {
				return 'fadingOut';
			} else if (relativeTime >= 0) {
				return 'holding';
			}
		}
		if (relativeTime >= -this.activeDuration) {
			return 'active';
		} else if (relativeTime >= -this.constructor.FADING_IN_DURATION - this.activeDuration) {
			return 'fadingIn';
		} else {
			return 'ready';
		}
	}

	updateState(relativeTime) {
		this.state = this.getStateByRelativeTime(relativeTime);
		this.visible = this.state !== 'ready' && this.state !== 'finished';
	}

	// Time is zero at the start of the fade-in,
	// and never exceeds FADING_IN_DURATION.
	updateFadingIn(time) {
	}

	// Progress is zero at the start of the active time,
	// and is one when the note is supposed to be hit.
	// It may exceed one (because the note may be hit late).
	updateActive(progress) {
	}

	// Progress is zero at the start of the hold,
	// and is one when the note is supposed to be released.
	// Never exceeds one, but may be negative.
	// Does not need overriding for non-hold notes.
	updateHolding(progress) {
	}

	// Time is zero at the start of the fade-out,
	// and never exceeds FADING_OUT_DURATION.
	updateFadingOut(time) {
	}

};
