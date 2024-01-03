Sunniesnow.Assets = {
	async loadTexture(url) {
		let result;
		if (Sunniesnow.ObjectUrl.urls.has(url)) {
			let loadParser;
			if (Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml') {
				loadParser = 'loadSVG';
			} else if (Sunniesnow.Utils.isBrowser()) {
				loadParser = 'loadTextures';
			} else {
				loadParser = 'loadNodeTexture';
			}
			result = await PIXI.Assets.load({src: url, loadParser});
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
			const result = await PIXI.Assets.load({src: url, loadParser: 'loadWebFont', data: {family}});
			if (!(result instanceof FontFace)) {
				throw new Error('Failed to load font');
			}
		} else {
			// https://github.com/pixijs/node/issues/5
			const path = require('path');
			const fs = require('fs');
			const dest = path.join(Sunniesnow.record.tempDir, path.basename(url));
			const data = await Sunniesnow.Utils.strictFetch(url).then(res => res.arrayBuffer());
			fs.writeFileSync(dest, Buffer.from(data));
			return await PIXI.Assets.load({src: dest, loadParser: 'loadNodeFont', data: {family}});
		}
	},

	async audioDecode(arrayBuffer, context) {
		const audioBuffer = await audioDecode(arrayBuffer);
		const result = context.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
		// https://github.com/audiojs/audio-decode/pull/35#issuecomment-1656137481
		for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
			result.copyToChannel(audioBuffer.getChannelData(i), i);
		}
		return result;
	}

};
