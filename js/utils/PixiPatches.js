Sunniesnow.PixiPatches = {
	apply() {
		// this.patchHasProtocol(); // fixed in PIXI 7.3
		if (!Sunniesnow.Utils.isBrowser()) {
			this.patchLoadSvg();
			this.patchExtractCanvas();
			this.patchNodeLoaderParsers();
		}
		this.patchAddTo();
	},

	// https://github.com/pixijs/pixijs/issues/9568#issuecomment-1653126302
	// fixed in https://github.com/pixijs/pixijs/commit/d1f23cfe62bf5004533ec4ac565b1945aa6ccdb3
	patchHasProtocol() {
		PIXI.utils.path.hasProtocol = function (path) {
			return (/^[^/:]+:/).test(this.toPosix(path));
		};
	},

	// https://github.com/pixijs/node/issues/4
	patchLoadSvg() {
		let src = PIXI.SVGResource.prototype._loadSvg.toString().match(/\{(.*)\}/s)[1];
		src = src.replace(/tempImage\.src\s*=\s*this\.svg[,;]/, '');
		src += 'tempImage.src = this.svg;'
		PIXI.SVGResource.prototype._loadSvg = new Function(
			'Image', 'BaseImageResource', 'uid',
			`return (function _loadSvg() { ${src} });`
		)(require('canvas').Image, PIXI.BaseImageResource, PIXI.utils.uid);
	},

	// https://github.com/pixijs/node/issues/11
	patchExtractCanvas() {
		let src = PIXI.Extract.prototype.canvas.toString();
		PIXI.Extract.prototype.canvas = new Function(
			'ImageData', '_Extract2', 'utils',
			`return (function ${src});`
		)(require('canvas').ImageData, PIXI.Extract, PIXI.utils);
	},

	// https://github.com/pixijs/node/pull/13
	patchNodeLoaderParsers() {
		PIXI.loadNodeTexture.name = 'loadNodeTexture';
		PIXI.loadNodeFont.name = 'loadNodeFont';
		PIXI.loadNodeBase64.name = 'loadNodeBase64';
	},

	// Then I can use child?.addTo(parent) instead of child && parent.addChild(child).
	patchAddTo() {
		PIXI.Container.prototype.addTo = function (parent) {
			parent.addChild(this);
			return this;
		}
	}
};
