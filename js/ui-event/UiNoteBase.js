Sunniesnow.UiNoteBase = class UiNote extends Sunniesnow.UiEvent {

	constructor(event) {
		super(event);
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		[this.x, this.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
	}

	static fadingInDuration(event) {
		return 1/4; // Sunniesnow.game.settings.scroll ? 0 : 1/4;
	}

	static fadingOutDuration(event) {
		return 2/3;
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		if (!Sunniesnow.game.settings.scroll) {
			return;
		}
		this.y = Sunniesnow.Config.SCROLL_START_Y;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha(progress, relativeTime);
		if (Sunniesnow.game.settings.scroll) {
			this.y = Sunniesnow.Config.scrollY(progress);
		}
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
		if (Sunniesnow.game.settings.scroll && Sunniesnow.game.settings.autoplay) {
			this.y = Sunniesnow.Config.SCROLL_END_Y;
		}
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		if (Sunniesnow.game.settings.scroll && Sunniesnow.game.settings.autoplay) {
			this.y = Sunniesnow.Config.SCROLL_END_Y;
		}
	}

	update(relativeTime) {
		this.fadingAlpha = 1; // to be updated in updateActive(); will be used in UiNotesBoard and UiBgNotesBoard
		super.update(relativeTime);
	}

};
