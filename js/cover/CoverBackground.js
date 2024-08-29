Sunniesnow.CoverBackground = class CoverBackground extends PIXI.Container {

	async populate() {
		//this.background = new PIXI.Sprite(Sunniesnow.Background.texture);
		// https://github.com/pixijs/pixijs/issues/10894
		this.background = PIXI.Sprite.from(await Sunniesnow.game.app.renderer.extract.image(Sunniesnow.Background.texture));
		this.addChild(this.background);
	}
};
