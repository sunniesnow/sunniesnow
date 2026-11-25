Sunniesnow.CoverBackground = class CoverBackground extends PIXI.Container {

	async populate() {
		const tempSprite = new PIXI.Sprite(Sunniesnow.Background.texture);
		// Must use extraction because https://github.com/pixijs/pixijs/issues/10894
		// Must composite onto clear color before extraction because https://github.com/pixijs/pixijs/issues/10820
		this.background = PIXI.Sprite.from(await Sunniesnow.game.app.renderer.extract.canvas({
			target: tempSprite,
			frame: new PIXI.Rectangle(0, 0, Sunniesnow.game.settings.width, Sunniesnow.game.settings.height),
			resolution: 1,
			clearColor: Sunniesnow.game.settings.backgroundColor,
		}));
		this.addChild(this.background);
	}
};
