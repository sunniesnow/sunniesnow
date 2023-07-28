Sunniesnow.Assets = {
	async loadTexture(url) {
		if (Sunniesnow.Utils.isBrowser()) {
			let isSvg = Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml';
			return await PIXI.Assets.load({src: url, loadParser: isSvg ? 'loadSVG' : undefined});
		} else {
			return await PIXI.Assets.load(url);
		}
	},

	async loadFont(url, family) {
		if (Sunniesnow.Utils.isBrowser()) {
			return await PIXI.Assets.load({ src: url, loadParser: 'loadWebFont', data: { family } });
		} else {
			const path = require('path');
			const fs = require('fs');
			const dest = path.join(Sunniesnow.record.tempDir, path.basename(url));
			const data = await fetch(url).then(res => res.arrayBuffer());
			fs.writeFileSync(dest, Buffer.from(data));
			return await PIXI.Assets.load({ src: dest, data: { family } });
		}
	}
};
