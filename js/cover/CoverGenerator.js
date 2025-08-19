Sunniesnow.CoverGenerator = {

	async generate() {
		if (!Sunniesnow.game || !Sunniesnow.Loader.loadingComplete) {
			Sunniesnow.Logs.warn('Cannot generate a cover before the game is loaded');
			return;
		}
		const app = new PIXI.Application();
		await app.init({
			width: Sunniesnow.Config.WIDTH,
			height: Sunniesnow.Config.HEIGHT,
			backgroundColor: 'black',
			eventFeatures: {
				click: false,
				globalMove: false,
				move: false,
				wheel: false
			},
			forceCanvas: Sunniesnow.game.settings.renderer === 'canvas',
			antialias: Sunniesnow.game.settings.antialias,
			powerPreference: Sunniesnow.game.settings.powerPreference,
			autoStart: false
		});
		const cover = new Sunniesnow.Cover();
		await cover.populate();
		app.stage.addChild(cover);
		app.renderer.render(app.stage);
		const result = app.canvas.toDataURL('image/png');
		app.destroy(true, {children: true});
		return result;
	},

	// Use in browser
	async download() {
		Sunniesnow.Utils.download(await this.generate(), 'cover.png');
	}
};
