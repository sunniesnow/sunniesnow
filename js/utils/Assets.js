Sunniesnow.Assets = {
	progresses: new Map(),

	async loadTexture(url) {
		let loadParser;
		// Reason for using Sunniesnow.ObjectUrl: https://github.com/pixijs/pixijs/issues/9568
		if (Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml' || PIXI.loadSvg.test(url)) {
			loadParser = 'loadSVG';
		} else {
			loadParser = Sunniesnow.Utils.isBrowser() ? 'loadTextures' : 'loadNodeTexture';
		}
		const result = await this.loadPixiAssets(url, {loadParser});
		if (!(result instanceof PIXI.Texture)) {
			throw new Error('Failed to load texture');
		}
		return result;
	},

	async loadFont(url, family) {
		if (Sunniesnow.Utils.isFontAvailable(family)) {
			return;
		}
		if (Sunniesnow.game.settings.avoidDownloadingFonts) {
			Sunniesnow.Logs.warn(`Skipped downloading font ${family}`);
			return;
		}
		if (Sunniesnow.Utils.isBrowser()) {
			const result = await this.loadPixiAssets(url, {loadParser: 'loadWebFont', data: {family}});
			if (!(result instanceof FontFace)) {
				throw new Error('Failed to load font');
			}
			return result;
		} else {
			return await this.loadPixiAssets(
				url,
				{
					loadParser: 'loadNodeFont',
					// data: {family}, // https://github.com/Automattic/node-canvas/issues/2369
					downloadToFs: true // https://github.com/pixijs-userland/node/issues/5
				}
			);
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
	},

	async loadPixiAssets(url, options = {}) {
		const downloadToFs = options.downloadToFs ?? false;
		delete options.downloadToFs;
		const isObjectUrl = url.startsWith('blob:') || url.startsWith('data:');
		let blob;
		if (!isObjectUrl) {
			this.progresses.set(url, 0);
			const response = await Sunniesnow.Utils.strictFetch(url);
			const contentLength = Number(response.headers.get('Content-Length'));
			const reader = response.body.getReader();
			const chunks = [];
			let receivedLength = 0;
			while (true) {
				const {done, value} = await reader.read();
				if (done) {
					break;
				}
				chunks.push(value);
				receivedLength += value.length;
				this.progresses.set(url, receivedLength / contentLength);
			}
			blob = new Blob(chunks, {type: response.headers.get('Content-Type')});
		}
		let src;
		if (Sunniesnow.Utils.isBrowser() || !downloadToFs) {
			if (isObjectUrl) {
				src = url;
			} else {
				src = Sunniesnow.ObjectUrl.create(blob);
			}
		} else {
			const arrayBuffer = isObjectUrl ? await fetch(url).then(res => res.arrayBuffer()) : await blob.arrayBuffer();
			const path = require('path');
			const fs = require('fs');
			src = path.join(Sunniesnow.record.tempDir, path.basename(url));
			if (!fs.existsSync(src) || Sunniesnow.record.clean) {
				fs.writeFileSync(src, Buffer.from(arrayBuffer));
			}
		}
		const result = await PIXI.Assets.load({src, ...options});
		if (!isObjectUrl) {
			this.progresses.delete(url);
		}
		return result;
	}

};
