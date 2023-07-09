Sunniesnow.Note = class Note extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: { tipPoint: null }
	}

	static UI_CLASS = Sunniesnow.UiNote
	static LEVEL_CLASS = Sunniesnow.LevelNote
	static FX_CLASS = Sunniesnow.FxNote
	static SE_CLASS = Sunniesnow.Se
	static TYPE_NAME = 'note'

	appearTime() {
		const activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		return this.time - activeDuration - this.constructor.UI_CLASS.FADING_IN_DURATION;
	}

	hitSe(when) {
		this.constructor.SE_CLASS.hit(this.id, when);
	}

	releaseSe(when) {
		this.constructor.SE_CLASS.release(this.id, when);
	}

};
