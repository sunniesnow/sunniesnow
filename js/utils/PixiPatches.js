Sunniesnow.PixiPatches = {
	apply() {
		if (!Sunniesnow.Utils.isBrowser()) {
			this.patchLoadSvg();
			this.patchExtractCanvas();
			this.patchNodeLoaderParsers();
		}
		this.patchWorldVisible();
		this.patchAddTo();
	},

	// https://github.com/pixijs-userland/node/issues/4
	patchLoadSvg() {
		let src = PIXI.SVGResource.prototype._loadSvg.toString().match(/\{(.*)\}/s)[1];
		src = src.replace(/tempImage\.src\s*=\s*this\.svg[,;]/, '');
		src += 'tempImage.src = this.svg;'
		PIXI.SVGResource.prototype._loadSvg = new Function(
			'Image', 'BaseImageResource', 'uid',
			`return (function _loadSvg() { ${src} });`
		)(require('canvas').Image, PIXI.BaseImageResource, PIXI.utils.uid);
	},

	// https://github.com/pixijs-userland/node/issues/11
	patchExtractCanvas() {
		let src = PIXI.Extract.prototype.canvas.toString();
		PIXI.Extract.prototype.canvas = new Function(
			'ImageData', '_Extract2', 'utils',
			`return (function ${src});`
		)(require('canvas').ImageData, PIXI.Extract, PIXI.utils);
	},

	// https://github.com/pixijs-userland/node/pull/13
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
	},

	// https://github.com/pixijs/pixijs/issues/11030
	patchWorldVisible() {
		const worldVisibleDescriptor = {
			get() {
				return this.visible && (!this.parent || this.parent.worldVisible) && (!this.parentRenderLayer || this.parentRenderLayer.worldVisible);
			},
			readonly: true
		};
		Object.defineProperty(PIXI.Container.prototype, 'worldVisible', worldVisibleDescriptor);
		Object.defineProperty(PIXI.RenderLayer.prototype, 'worldVisible', worldVisibleDescriptor);
	}
};
