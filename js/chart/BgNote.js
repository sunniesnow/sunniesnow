Sunniesnow.BgNote = class BgNote extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: { tipPoint: null, text: '', duration: 0 }
	}

	static UI_CLASS = Sunniesnow.UiBgNote
	static TYPE_NAME = 'bgNote'

	appearTime() {
		const activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		return this.time - activeDuration - this.constructor.UI_CLASS.FADING_IN_DURATION;
	}
	
};
