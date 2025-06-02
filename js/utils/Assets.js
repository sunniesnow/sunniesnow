Sunniesnow.Assets = {
	async loadTexture(url) {
		let loadParser;
		// Reason for using Sunniesnow.ObjectUrl: https://github.com/pixijs/pixijs/issues/9568
		if (Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml' || PIXI.loadSVG.test(url)) {
			loadParser = 'loadSVG';
		} else {
			loadParser = Sunniesnow.Utils.isBrowser() ? 'loadTextures' : 'loadNodeTexture';
		}
		const result = await PIXI.Assets.load({src: url, loadParser});
		if (!(result instanceof PIXI.Texture)) {
			throw new Error('Failed to load texture');
		}
		return result;
	},

	async loadFont(url, family) {
		if (Sunniesnow.game.settings.avoidDownloadingFonts) {
			Sunniesnow.Logs.warn(`Skipped downloading font ${family}`);
			return;
		}
		if (Sunniesnow.Utils.isBrowser()) {
			const result = await PIXI.Assets.load({src: url, loadParser: 'loadWebFont', data: {family}});
			if (!(result instanceof FontFace)) {
				throw new Error('Failed to load font');
			}
		} else {
			// https://github.com/pixijs-userland/node/issues/5
			const path = require('path');
			const fs = require('fs');
			const dest = path.join(Sunniesnow.record.tempDir, path.basename(url));
			if (!fs.existsSync(dest) || Sunniesnow.record.clean) {
				const data = await Sunniesnow.Utils.strictFetch(url).then(res => res.arrayBuffer());
				fs.writeFileSync(dest, Buffer.from(data));
			}
			// https://github.com/Automattic/node-canvas/issues/2369
			return await PIXI.Assets.load({src: dest, loadParser: 'loadNodeFont'}); //, data: {family}});
		}
	},

	async audioDecode(arrayBuffer, context) {
		if (Sunniesnow.Utils.isBrowser() && !window.WebAssembly) {
			Sunniesnow.Logs.warn('WebAssembly is disabled; using browser native audio decoder');
			return await context.decodeAudioData(arrayBuffer);
		}
		const audioBuffer = await audioDecode(arrayBuffer);
		const result = context.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
		// https://github.com/audiojs/audio-decode/pull/35#issuecomment-1656137481
		for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
			result.copyToChannel(audioBuffer.getChannelData(i), i);
		}
		return result;
	}

};
