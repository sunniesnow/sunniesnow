Sunniesnow.UiEvent = class UiEvent extends PIXI.Container {

	static fadingInDuration(event) {
		return 0;
	}

	static fadingOutDuration(event) {
		return 0;
	}

	// Load assets in this method to avoid loading assets during game.
	// To be overridden in subclasses.
	static async load() {
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
				this.updateFadingIn((relativeTime + this.activeDuration) / this.fadingInDuration() + 1, relativeTime);
				break;
			case 'active':
				this.updateActive(relativeTime / this.activeDuration + 1, relativeTime);
				break;
			case 'holding':
				this.updateHolding(relativeTime / this.event.duration, relativeTime);
				break;
			case 'fadingOut':
				const releaseRelativeTime = this.levelNote ? this.levelNote.releaseRelativeTime : this.event.duration || 0;
				this.updateFadingOut((relativeTime - releaseRelativeTime) / this.fadingOutDuration(), relativeTime);
				break;
			case 'finished':
				// do nothing
				break;
		}
	}

	fadingOutDuration() {
		return this.constructor.fadingOutDuration(this.event);
	}

	fadingInDuration() {
		return this.constructor.fadingInDuration(this.event);
	}

	getStateByRelativeTime(relativeTime) {
		if (this.levelNote) {
			if (this.levelNote.hitRelativeTime !== null) {
				if (this.levelNote.releaseRelativeTime !== null) {
					if (relativeTime >= this.levelNote.releaseRelativeTime + this.fadingOutDuration()) {
						return 'finished';
					} else if (relativeTime >= this.levelNote.releaseRelativeTime) {
						return 'fadingOut';
					} else {
						return 'finished';
					}
				} else if (this.event.duration > 0) {
					return 'holding';
				} else {
					return 'active';
				}
			}
		} else {
			const releaseRelativeTime = this.event.duration || 0;
			if (relativeTime >= releaseRelativeTime + this.fadingOutDuration()) {
				return 'finished';
			} else if (relativeTime >= releaseRelativeTime) {
				return 'fadingOut';
			} else if (relativeTime >= 0) {
				return 'holding';
			}
		}
		if (relativeTime >= -this.activeDuration) {
			return 'active';
		} else if (relativeTime >= -this.fadingInDuration() - this.activeDuration) {
			return 'fadingIn';
		} else {
			return 'ready';
		}
	}

	updateState(relativeTime) {
		this.state = this.getStateByRelativeTime(relativeTime);
		this.visible = this.state !== 'ready' && this.state !== 'finished';
	}

	// Progress is zero at the start of the fade-in,
	// and never exceeds 1.
	updateFadingIn(progress, relativeTime) {
	}

	// Progress is zero at the start of the active time,
	// and is one when the note is supposed to be hit.
	// It may exceed one (because the note may be hit late).
	updateActive(progress, relativeTime) {
	}

	// Progress is zero at the start of the hold,
	// and is one when the note is supposed to be released.
	// Never exceeds one, but may be negative.
	// Does not need overriding for non-hold notes.
	updateHolding(progress, relativeTime) {
	}

	// Time is zero at the start of the fade-out,
	// and never exceeds 1.
	updateFadingOut(progress, relativeTime) {
	}

};
