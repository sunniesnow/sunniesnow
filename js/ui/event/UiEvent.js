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
		// This is only used in getBeforeTimeStateByRelativeTime(),
		// so it can be safely ignored if that method is overridden.
		// It is mostly a legacy from when Sunniesnow did not support SV,
		// and we should be able to delete it after some minor refactoring.
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
				this.updateFadingIn(this.stateProgress, relativeTime);
				break;
			case 'active':
				this.updateActive(this.stateProgress, relativeTime);
				break;
			case 'holding':
				this.updateHolding(this.stateProgress, relativeTime);
				break;
			case 'fadingOut':
				this.updateFadingOut(this.stateProgress, relativeTime);
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

	// Not nullable. Only called when getAfterTimeStateByRelativeTime() returns null.
	getBeforeTimeStateByRelativeTime(relativeTime) {
		if (relativeTime >= -this.activeDuration) {
			return ['active', relativeTime / this.activeDuration + 1];
		}
		if (relativeTime >= -this.fadingInDuration() - this.activeDuration) {
			return ['fadingIn', (relativeTime + this.activeDuration) / this.fadingInDuration() + 1];
		}
		return ['ready'];
	}

	// Nullable.
	getAfterTimeStateByRelativeTime(relativeTime) {
		const releaseRelativeTime = this.event.duration ?? 0;
		if (relativeTime >= releaseRelativeTime + this.fadingOutDuration()) {
			return ['finished'];
		}
		if (relativeTime >= releaseRelativeTime) {
			return ['fadingOut', (relativeTime - releaseRelativeTime) / this.fadingOutDuration()];
		}
		if (relativeTime >= 0) {
			return ['holding', relativeTime / this.event.duration];
		}
	}

	updateState(relativeTime) {
		[this.state, this.stateProgress] = this.getAfterTimeStateByRelativeTime(relativeTime) ?? this.getBeforeTimeStateByRelativeTime(relativeTime);
		this.visible = this.state !== 'ready' && this.state !== 'finished';
	}

	// Progress is zero at the start of the fade-in,
	// and never exceeds 1.
	updateFadingIn(progress, relativeTime) {
	}

	// Progress is zero at the start of the active time,
	// and is one when the note is supposed to be hit.
	// It may exceed one (because the note may be hit late and because speed may be negative).
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
