Sunniesnow.Assets = {
	async loadTexture(url) {
		let isSvg = Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml';
		return await PIXI.Assets.load({src: url, loadParser: isSvg ? 'loadSVG' : undefined});
	},

	async loadFont(url, family) {
		return await PIXI.Assets.load({src: url, loadParser: 'loadWebFont', data: {family}});
	}
};
