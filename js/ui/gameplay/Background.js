Sunniesnow.Background = class Background extends Sunniesnow.UiComponent {

	static EFFECT_EVENT_CLASS = 'EffectBackground';
	static DEFAULT_X = 0.5;
	static DEFAULT_Y = 0.5;

	static async load() {
		this.texture = this.applyEffects(Sunniesnow.game.settings.background ?? PIXI.Texture.WHITE);
	}

	static applyEffects(texture) {
		const tempSprite = new PIXI.Sprite(texture);
		tempSprite.anchor.set(0.5);
		const width = Sunniesnow.Config.WIDTH;
		const height = Sunniesnow.Config.HEIGHT;
		tempSprite.scale.set(Math.max(width / texture.width, height / texture.height));
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
		const result = Sunniesnow.game.app.renderer.generateTexture(
			wrapper,
			{region: new PIXI.Rectangle(-width / 2, -height / 2, width, height)}
		);
		wrapper.destroy({children: true});
		return result;
	}
	
	populate() {
		super.populate();
		this.label = 'background';
		this.background = new PIXI.Sprite(this.constructor.texture);
		this.background.anchor.set(0.5);
		this.background.label = 'background';
		this.addChild(this.background);
	}
};
