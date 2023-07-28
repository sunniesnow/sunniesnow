Sunniesnow.PixiPatches = {
	apply() {
		this.patchHasProtocol();
		if (!Sunniesnow.Utils.isBrowser()) {
			this.patchLoadSvg();
			this.patchExtractCanvas();
			this.patchExtractRawPixels();
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

	patchExtractCanvas() {
		PIXI.Extract.prototype.canvas = new Function(
			'_Extract', 'utils', 'ImageData',
			`return (function ${PIXI.Extract.prototype.canvas.toString()});`
		)(PIXI.Extract, PIXI.utils, require('canvas').ImageData);
	},

	patchExtractRawPixels() {
		const oldFunction = PIXI.Extract.prototype._rawPixels.toString();
		const [_, target, frame] = oldFunction.split('\n')[0].match(/\((\w+),\s*(\w+)\)\s*\{/)
		const generateTextureOptions = oldFunction.match(new RegExp(`\\.generateTexture\\s*\\(${target},\\s*\\{(.*?)\\}\\s*\\)`, 's'))[1].split(',');
		const shouldPatch = !generateTextureOptions.some(o => new RegExp(`region:\\s*${frame}`).test(o));
		if (!shouldPatch) {
			return;
		}
		const newGenerateTextureOptions = generateTextureOptions.slice();
		newGenerateTextureOptions.unshift(`region: ${frame}`);
		PIXI.Extract.prototype._rawPixels = new Function(
			'RenderTexture', 'TEMP_RECT', 'BYTES_PER_PIXEL',
			`return (function ${oldFunction.replace(generateTextureOptions.join(','), newGenerateTextureOptions.join(','))});`
		)(PIXI.RenderTexture, new PIXI.Rectangle(), 4);
	}
};
