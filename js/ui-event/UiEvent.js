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

	updateState(relativeTime) {
		const releaseRelativeTime = this.releaseRelativeTime();
		switch (this.state) {
			case 'ready':
				if (relativeTime >= -this.constructor.FADING_IN_DURATION - this.activeDuration) {
					this.visible = true;
					this.state = 'fadingIn';
				}
			case 'fadingIn':
				if (relativeTime >= -this.activeDuration) {
					this.state = 'active';
				}
			case 'active':
				if (this.levelNote) {
					if (this.levelNote.hitRelativeTime !== null) {
						this.state = 'holding';
					}
				} else {
					if (relativeTime >= this.event.time) {
						this.state = 'holding';
					}
				}
			case 'holding':
				if (releaseRelativeTime !== null && relativeTime >= releaseRelativeTime) {
					this.state = 'fadingOut';
				}
			case 'fadingOut':
				if (releaseRelativeTime !== null && relativeTime - releaseRelativeTime >= this.constructor.FADING_OUT_DURATION) {
					this.visible = false;
					this.state = 'finished';
				}
		}
	}

	releaseRelativeTime() {
		if (this.levelNote) {
			return this.levelNote.releaseRelativeTime;
		} else if ('duration' in this.event) {
			return this.event.time + this.event.duration;
		} else {
			return null;
		}
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
