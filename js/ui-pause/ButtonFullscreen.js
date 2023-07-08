Sunniesnow.ButtonFullscreen = class ButtonFullscreen extends Sunniesnow.ButtonResume {
	static async load() {
		await super.load();
		this.text = 'Fullscreen';
	}

	populate() {
		super.populate();
		this.x = Sunniesnow.game.settings.width / 4*3;
	}

};
