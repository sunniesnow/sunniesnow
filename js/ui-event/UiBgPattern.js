Sunniesnow.UiBgPattern = class UiBgPattern extends Sunniesnow.UiEvent {
	
	static fadingInDuration(event) {
		return 1/6;
	}

	static fadingOutDuration(event) {
		return 1/6;
	}

	constructor(event) {
		super(event);
		this.x = Sunniesnow.Config.WIDTH / 2;
		this.y = Sunniesnow.Config.HEIGHT / 2;
	}
};
