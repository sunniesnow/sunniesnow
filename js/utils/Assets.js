Sunniesnow.Assets = {
	async loadTexture(url) {
		let result;
		if (Sunniesnow.Utils.isBrowser()) {
			let isSvg = Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml';
			result = await PIXI.Assets.load({src: url, loadParser: isSvg ? 'loadSVG' : undefined});
		} else {
			result = await PIXI.Assets.load(url);
		}
		if (!(result instanceof PIXI.Texture)) {
			throw new Error('Failed to load texture');
		}
		return result;
	},

	async loadFont(url, family) {
		if (Sunniesnow.Utils.isBrowser()) {
			const result = await PIXI.Assets.load({ src: url, loadParser: 'loadWebFont', data: { family } });
			if (!(result instanceof FontFace)) {
				throw new Error('Failed to load font');
			}
		} else {
			const path = require('path');
			const fs = require('fs');
			const dest = path.join(Sunniesnow.record.tempDir, path.basename(url));
			const data = await fetch(url).then(res => {
				if (!res.ok) {
					throw new Error('Failed to load font');
				}
				res.arrayBuffer();
			});
			fs.writeFileSync(dest, Buffer.from(data));
			return await PIXI.Assets.load({src: dest, data: {family}});
		}
	},

	async audioDecode(arrayBuffer, context) {
		const audioBuffer = await audioDecode(arrayBuffer);
		const result = context.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
		for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
			result.copyToChannel(audioBuffer.getChannelData(i), i);
		}
		return result;
	}

};
