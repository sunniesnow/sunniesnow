Sunniesnow.Assets = {
	progresses: new Map(),

	async loadTexture(url) {
		let parser;
		// Reason for using Sunniesnow.ObjectUrl: https://github.com/pixijs/pixijs/issues/9568
		if (Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml' || PIXI.loadSvg.test(url)) {
			parser = 'svg';
		} else {
			parser = Sunniesnow.Utils.isBrowser() ? 'texture' : 'node-texture';
		}
		const result = await this.loadPixiAssets(url, {parser});
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
			const result = await this.loadPixiAssets(url, {parser: 'web-font', data: {family}});
			if (!(result instanceof FontFace)) {
				throw new Error('Failed to load font');
			}
			return result;
		} else {
			return await this.loadPixiAssets(
				url,
				{
					parser: 'node-font',
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
		let result = await audioDecode(arrayBuffer);
		if (context) {
			const newResult = context.createBuffer(result.numberOfChannels, result.length, result.sampleRate);
			// https://github.com/audiojs/audio-decode/pull/35#issuecomment-1656137481
			for (let i = 0; i < result.numberOfChannels; i++) {
				newResult.copyToChannel(result.getChannelData(i), i);
			}
			result = newResult;
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
