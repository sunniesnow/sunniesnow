Sunniesnow.ButtonFullscreen = class ButtonFullscreen extends Sunniesnow.ButtonResume {
	static async load() {
		await super.load();
		this.text = 'Fullscr';
	}

	populate() {
		super.populate();
		this.label = 'button-fullscreen';
		this.x = Sunniesnow.Config.WIDTH / 4*3;
	}

};
