Sunniesnow.Background = class Background extends Sunniesnow.UiComponent {

	static async load() {
		try {
			this.texture = await PIXI.Texture.fromURL(this.getUrl());
		} catch (err) {
			this.texture = PIXI.Texture.WHITE;
			console.log(err);
			Sunniesnow.Utils.warn('Failed to load background');
		}
	}

	static getUrl() {
		switch (Sunniesnow.game.settings.background) {
			case 'online':
				return Sunniesnow.game.settings.backgroundOnline;
			case 'from-level':
				return Sunniesnow.Loader.loaded.chart.backgrounds[Sunniesnow.game.settings.backgroundFromLevel];
			case 'upload':
				return Sunniesnow.Loader.loaded.background;
		}
	}

	populate() {
		super.populate();
		this.background = new PIXI.Sprite(this.constructor.texture);
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
