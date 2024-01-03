Sunniesnow.PixiPatches = {
	apply() {
		this.patchHasProtocol();
		if (!Sunniesnow.Utils.isBrowser()) {
			this.patchLoadSvg();
			this.patchNodeLoaderParsers();
		}
	},

	patchHasProtocol() {
		PIXI.utils.path.hasProtocol = function (path) {
			return (/^[^/:]+:/).test(this.toPosix(path));
		};
	},

	patchLoadSvg() {
		let src = PIXI.SVGResource.prototype._loadSvg.toString().match(/\{(.*)\}/s)[1];
		src = src.replace(/tempImage\.src\s*=\s*this\.svg[,;]/, '');
		src += 'tempImage.src = this.svg;'
		PIXI.SVGResource.prototype._loadSvg = new Function(
			'Image', 'BaseImageResource', 'uid',
			`return (function _loadSvg() { ${src} });`
		)(require('canvas').Image, PIXI.BaseImageResource, PIXI.utils.uid);
	},

	patchNodeLoaderParsers() {
		PIXI.loadNodeTexture.name = 'loadNodeTexture';
		PIXI.loadNodeFont.name = 'loadNodeFont';
		PIXI.loadNodeBase64.name = 'loadNodeBase64';
	}
};
