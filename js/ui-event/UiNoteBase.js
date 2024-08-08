Sunniesnow.UiNoteBase = class UiNote extends Sunniesnow.UiEvent {

	constructor(event) {
		super(event);
		this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		[this.x, this.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
	}

	static fadingInDuration(event) {
		return Sunniesnow.game.settings.scroll ? 0 : 1/4;
	}

	static fadingOutDuration(event) {
		return 2/3;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		if (!Sunniesnow.game.settings.scroll) {
			return;
		}
		this.y = Sunniesnow.Config.scrollY(progress);
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		if (!Sunniesnow.game.settings.scroll || !Sunniesnow.game.settings.autoplay) {
			return;
		}
		this.y = Sunniesnow.Config.SCROLL_END_Y;
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		if (!Sunniesnow.game.settings.scroll || !Sunniesnow.game.settings.autoplay) {
			return;
		}
		this.y = Sunniesnow.Config.SCROLL_END_Y;
	}

};
