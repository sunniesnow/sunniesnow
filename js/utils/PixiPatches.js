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
		const old = PIXI.SVGResource.prototype._loadSvg.toString().match(/\{(.*)\}/s)[1].split('\n');
		const srcLineno = old.findIndex(l => /\w+\.src\s*=\s*this\.svg/.test(l));
		old.push(old.splice(srcLineno, 1)[0]);
		PIXI.SVGResource.prototype._loadSvg = new Function(
			'Image', 'BaseImageResource', 'uid',
			`return (function _loadSvg() { ${old.join('\n')} });`
		)(require('canvas').Image, PIXI.BaseImageResource, PIXI.utils.uid);
	},

	patchNodeLoaderParsers() {
		PIXI.loadNodeTexture.name = 'loadNodeTexture';
		PIXI.loadNodeFont.name = 'loadNodeFont';
		PIXI.loadNodeBase64.name = 'loadNodeBase64';
	}
};
