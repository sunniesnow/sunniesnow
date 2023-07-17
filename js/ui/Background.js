Sunniesnow.Background = class Background extends Sunniesnow.UiComponent {

	static async load() {
		const url = Sunniesnow.Loader.backgroundUrl();
		if (!url) {
			this.texture = PIXI.Texture.WHITE;
			return;
		}
		try {
			this.texture = await PIXI.Texture.fromURL(url);
		} catch (err) {
			this.texture = PIXI.Texture.WHITE;
			Sunniesnow.Utils.warn('Failed to load background', err);
		}
	}

	populate() {
		super.populate();
		this.background = new PIXI.Sprite(this.constructor.texture);
		this.background.anchor.set(0.5);
		this.background.x = Sunniesnow.game.settings.width / 2;
		this.background.y = Sunniesnow.game.settings.height / 2;
		const scale = Math.max(
			Sunniesnow.game.settings.width / this.background.width,
			Sunniesnow.game.settings.height / this.background.height
		);
		this.background.scale.x = scale;
		this.background.scale.y = scale;
		const blurFilter = new PIXI.BlurFilter(Sunniesnow.game.settings.backgroundBlur, 10);
		const brightnessFilter = new PIXI.ColorMatrixFilter();
		brightnessFilter.brightness(Sunniesnow.game.settings.backgroundBrightness);
		this.background.filters = [blurFilter, brightnessFilter];
		this.addChild(this.background);
	}
};
