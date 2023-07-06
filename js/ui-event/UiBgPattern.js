Sunniesnow.UiBgPattern = class UiBgPattern extends Sunniesnow.UiEvent {
	static FADING_IN_DURATION = 1/6;
	static FADING_OUT_DURATION = 1/6;

	constructor(event) {
		super(event);
		this.x = Sunniesnow.game.settings.width / 2;
		this.y = Sunniesnow.game.settings.height / 2;
	}
};
