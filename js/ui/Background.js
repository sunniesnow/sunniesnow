Sunniesnow.Background = class Background extends Sunniesnow.UiComponent {

	static async load() {
		const tempTexture = await this.getBackgroundTexture();
		const tempSprite = new PIXI.Sprite(tempTexture);
		tempSprite.anchor.set(0.5);
		const width = Sunniesnow.game.settings.width;
		const height = Sunniesnow.game.settings.height;
		tempSprite.scale.set(Math.max(width / tempTexture.width, height / tempTexture.height));
		if (Sunniesnow.game.settings.renderer === 'webgl') {
			tempSprite.filters = [new PIXI.BlurFilter(Sunniesnow.game.settings.backgroundBlur, 10)];
		}
		const b = Sunniesnow.game.settings.backgroundBrightness;
		tempSprite.tint = [b, b, b];
		const wrapper = new PIXI.Container();
		wrapper.addChild(tempSprite);
		this.texture = Sunniesnow.game.app.renderer.generateTexture(
			wrapper,
			{region: new PIXI.Rectangle(-width / 2, -height / 2, width, height)}
		);
	}

	static async getBackgroundTexture() {
		const url = Sunniesnow.Loader.backgroundUrl();
		if (!url) {
			tempTexture = PIXI.Texture.WHITE;
			return;
		}
		try {
			return await Sunniesnow.Assets.loadTexture(url);
		} catch (err) {
			console.error(err);
			const result = PIXI.Texture.WHITE;
			Sunniesnow.Utils.warn('Failed to load background', err);
			return result;
		}
	}

	populate() {
		super.populate();
		this.background = new PIXI.Sprite(this.constructor.texture);
		this.addChild(this.background);
	}
};
