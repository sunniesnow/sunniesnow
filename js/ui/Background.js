Sunniesnow.Background = class Background extends Sunniesnow.UiComponent {

	static EFFECT_EVENT_CLASS = 'EffectBackground';
	static DEFAULT_X = 0.5;
	static DEFAULT_Y = 0.5;

	static async load() {
		this.originalTexture = await this.getBackgroundTexture();
		const tempSprite = new PIXI.Sprite(this.originalTexture);
		tempSprite.anchor.set(0.5);
		const width = Sunniesnow.Config.WIDTH;
		const height = Sunniesnow.Config.HEIGHT;
		tempSprite.scale.set(Math.max(width / this.originalTexture.width, height / this.originalTexture.height));
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			const filter1 = new PIXI.BlurFilter({strength: Sunniesnow.game.settings.backgroundBlur, quality: 10});
			const filter2 = new PIXI.ColorMatrixFilter();
			filter2.matrix[18] = 0;
			filter2.matrix[19] = 1;
			tempSprite.filters = [filter1, filter2];
		}
		const b = Sunniesnow.game.settings.backgroundBrightness;
		tempSprite.tint = [b, b, b];
		const wrapper = new PIXI.Container();
		wrapper.addChild(tempSprite);
		this.texture = Sunniesnow.game.app.renderer.generateTexture(
			wrapper,
			{region: new PIXI.Rectangle(-width / 2, -height / 2, width, height)}
		);
		wrapper.destroy({children: true});
	}

	static backgroundUrl() {
		let blob;
		switch (Sunniesnow.game.settings.background) {
			case 'none':
				return null;
			case 'online':
				return Sunniesnow.Utils.url('background', Sunniesnow.game.settings.backgroundOnline);
			case 'from-level':
				blob = Sunniesnow.game.loaded.chart.backgrounds[Sunniesnow.game.settings.backgroundFromLevel];
				if (!blob) {
					Sunniesnow.Logs.warn('No background provided');
					return;
				}
				break;
			case 'upload':
				blob = Sunniesnow.game.settings.backgroundUpload;
				if (!blob) {
					Sunniesnow.Logs.warn('No background provided');
					return;
				}
				break;
		}
		return Sunniesnow.ObjectUrl.create(blob);
	}
	
	static async getBackgroundTexture() {
		const url = this.backgroundUrl();
		if (!url) {
			return PIXI.Texture.WHITE;
		}
		try {
			return await Sunniesnow.Assets.loadTexture(url);
		} catch (err) {
			const result = PIXI.Texture.WHITE;
			Sunniesnow.Logs.warn(`Failed to load background: ${err.message ?? err}`, err);
			return result;
		}
	}

	populate() {
		super.populate();
		this.background = new PIXI.Sprite(this.constructor.texture);
		this.background.anchor.set(0.5);
		this.addChild(this.background);
	}
};
