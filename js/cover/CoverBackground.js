Sunniesnow.CoverBackground = class CoverBackground extends PIXI.Container {

	async populate() {
		//this.background = new PIXI.Sprite(Sunniesnow.Background.texture);
		// The above does not work because https://github.com/pixijs/pixijs/issues/10894
		// Must use extract.canvas below because https://github.com/pixijs-userland/node/issues/22
		this.background = PIXI.Sprite.from(await Sunniesnow.game.app.renderer.extract.canvas(Sunniesnow.Background.texture));
		this.addChild(this.background);
	}
};
